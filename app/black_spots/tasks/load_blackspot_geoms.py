"""Combines a CSV of black spot predictions with road segments to output blackspot geometries

The modeling outputs a CSV containing blackspots and a geometry ID corresponding to the 'id' column
in the combined segments shapefile. To visualize this or load it into the DRIVER web app, this
script recombines the detected blackspots with the corresponding road segment geometries.
"""
import csv
import math
import os

import fiona
from shapely.geometry import shape, mapping
from celery import shared_task
from celery.utils.log import get_task_logger

from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry
from django.utils import timezone

from grout.models import RecordType
from black_spots.models import BlackSpot, BlackSpotSet

logger = get_task_logger(__name__)


@shared_task
def load_blackspot_geoms(segments_shp, black_spots_csv, record_type_id, src_srid,
                         output_dir=None, output_shapefile='blackspots.shp',
                         output_json_file='blackspots.json', buffer_distance=5.0,
                         forecast_column='forecast-notsev', output_percentile=0.95):
    """Orchestrate converting model output in the form of CSVs to Blackspot model objects
    Args:
        segments_shp (string): Path to the shapefile containing roads segments used for forecasts
        black_spots_csv (string): Path to the CSV with model forecast output
        record_type_id (UUID): ID of RecordType with which to associate new blackspot set.
        src_srid (int): EPSG identifier of projection of segments_shp.
        output_dir (string): Path to directory to output shapefiles and GeoJSON. No output if None
        output_shapefile (string): Name of blackspots shapefile to output in output_dir.
        output_json_file (string): Name of blackspots GeoJSON to output in output_dir.
        buffer_distance (float): Number of meters to buffer road segment lines on output
        forecast_column (string): Column in the CSV from which to retrieve forecast values
        output_percentile (float): Only output shapes with forecasts at or above this percentile.
    """
    logger.info('Reading black spots...')
    black_spot_recs = read_black_spots(black_spots_csv, forecast_column)

    logger.info('Filtering to percentile {}...'.format(output_percentile))
    cutoff = percentile(sorted(map(lambda bsp: float(bsp[forecast_column]), black_spot_recs)),
                        output_percentile)
    output_spots = filter(lambda spot: float(spot[forecast_column]) >= cutoff, black_spot_recs)
    logger.info('Kept {} out of {} records'.format(len(output_spots), len(black_spot_recs)))

    logger.info('Creating black spot geometries...')
    black_spot_features = join_spots_to_segments(output_spots, segments_shp,
                                                 buffer_dist=buffer_distance)

    logger.info('Loading blackspots to database')
    black_spot_set = create_black_spot_set(record_type_id, invalidate_prior=True)
    blackspot_objects = [blackspot_from_feature(bsf, black_spot_set, src_srid, recs_prop='records',
                                                score_prop='forecast-notsev')
                         for bsf in black_spot_features]
    BlackSpot.objects.bulk_create(blackspot_objects)
    if output_dir:
        # Detect new columns between shapefile and CSV; these will get added to the output
        logger.info('Detecting output parameters...')
        output_schema, output_crs = construct_output_params(segments_shp, black_spots_csv)

        # If we buffer then that guarantees that everything's a Polygon, so update the output schema
        if buffer_distance != 0.0:
            output_schema['geometry'] = 'Polygon'

        logger.info('Writing black spot shapefile...')
        shapefile_out_path = os.path.join(output_dir, output_shapefile)
        write_features(black_spot_features, shapefile_out_path, output_schema,
                       'ESRI Shapefile', output_crs)

        logger.info('Writing black spot JSON...')
        json_out_path = os.path.join(output_dir, output_json_file)
        write_features(black_spot_features, json_out_path, output_schema,
                       'GeoJSON', output_crs)

    logger.info('Done.')


def construct_output_params(segments_shp, black_spots_csv):
    """Generate an output schema by determining new columns in the CSV

    Args:
        segments_shp (string): Path to segments shapefile
        black_spots_csv (string): Path to blackspots CSV file
    Returns:
        A tuple of (schema, crs) where schema is a fiona schema containing the schema of the output,
        and crs is the Fiona CRS of the input.
    """
    with fiona.open(segments_shp, 'r') as segments:
        with open(black_spots_csv, 'rb') as spots:
            reader = csv.DictReader(spots)
            out_schema = segments.schema.copy()
            for field in reader.fieldnames:
                if field not in out_schema['properties']:
                    # TODO: Make this configurable somehow
                    out_schema['properties'][field] = 'float'
        return out_schema, segments.crs


def read_black_spots(black_spots_csv, sorted=True):
    """Return a list of black spot records, optionally sorted by id

    Args:
        black_spots_csv (string): Path to blackspots CSV file
        forecast_column (string): Name of column containing forecast values
        sorted (boolean): Default True. Whether to sort the black spot records by the id field
    Returns:
        List of black spot records, optionally sorted by the id field
    """
    with open(black_spots_csv, 'rb') as spots:
        reader = csv.DictReader(spots)
        spots_list = list(reader)
        if sorted:
            spots_list.sort(key=lambda spot: int(spot['id']))
        return spots_list


def join_spots_to_segments(black_spots, segments_shp, buffer_dist=0.0):
    """Output features for each black spot record.

    Joins each black spot record to the geometry of the appropriate segment.
    Args:
        black_spots (list): A list of blackspot records, as dicts
        segments_shp (string): Path to road segments shapefile
        buffer_dist (float): Distance to buffer geometries before returning them
    Returns:
        List of black spot features
    """
    spot_features = []
    with fiona.open(segments_shp, 'r') as source:
        for spot in black_spots:
            index = int(spot['id'])
            feature = source[index]
            if buffer_dist != 0.0:
                # Fiona features are just lists of coordinates, so we need to pass through
                # Shapely to perform geometric operations like buffering.
                geom = shape(feature['geometry']).buffer(buffer_dist)
                # This will discard interior rings, so roads with tight curvatures might show
                # up as blobs rather than loops (highway offramps?), but this will likely
                # be relatively rare and it shouldn't make the blackspot harder to identify.
                feature['geometry'] = mapping(geom)
            assert feature['id'] == spot['id']
            # Overwrite feature properties with blackspot values
            feature['properties'].update(**{key: value for key, value in spot.items()
                                            if key != 'id'})
            spot_features.append(feature)
    return spot_features


def write_features(features, output_filename, output_schema, driver, crs):
    """Writes OGR features to a file
    Args:
        features (list): List of fiona features to write
        output_filename (string): The path of the file to write to
        output_schema (dict): Schema to use when writing
        driver (string): Name of the OGR driver to use when writing
        crs (dict): Fiona CRS of data to be written
    Returns:
        None
    """
    with fiona.open(output_filename, 'w', driver=driver, schema=output_schema, crs=crs) as output:
        for f in features:
            output.write(f)


def create_black_spot_set(record_type_id, invalidate_prior=False):
    """Creates a new BlackSpotSet object and optionally invalidates existing BlackSpotSets.
    Args:
        record_type_id (UUID): ID of RecordType to associate with this BlackSpotSet
        invalidate_prior (bool): Whether to invalidate existing BlackSpotSets of this RecordType.
    Returns:
        Newly created BlackSpotSet
    """
    now = timezone.now()
    record_type = RecordType.objects.get(pk=record_type_id)
    bss = BlackSpotSet.objects.create(effective_start=now, record_type=record_type)
    if invalidate_prior:
        (BlackSpotSet.objects.filter(record_type=record_type, effective_end=None)
         .exclude(pk=bss.pk)
         .update(effective_end=now))
    return bss


def blackspot_from_feature(feature, black_spot_set, src_srid, score_prop=None, recs_prop=None,
                           recs_severe_prop=None):
    """Create an unsaved BlackSpot from a fiona feature
    Args:
        feature (fiona Feature): The feature to use to create the BlackSpot
        black_spot_set (BlackSpotSet): BlackSpotSet to associate with new BlackSpot
        src_srid (int): EPSG identifier of source for features
        score_prop (string): Property of feature to use to populate severity_score
        recs_prop (string): Property of feature to use to populate num_records
        recs_severe_prop (string): Property of feature to use to populate num_severes
    """
    blackspot = BlackSpot()
    geometry = GEOSGeometry(buffer(shape(feature['geometry']).wkb), srid=src_srid)
    geometry.transform(settings.GROUT['SRID'])
    blackspot.geom = geometry
    blackspot.black_spot_set = black_spot_set
    blackspot.severity_score = feature['properties'][score_prop] if score_prop else 0.0
    blackspot.num_records = feature['properties'][recs_prop] if recs_prop else 0
    blackspot.num_severe = feature['properties'][recs_severe_prop] if recs_severe_prop else 0
    return blackspot


# Copied from http://code.activestate.com/recipes/511478-finding-the-percentile-of-the-values/
# with some alterations to strip out functionality we don't need and comply with our style.
def percentile(values, percent):
    """
    Find the percentile of a list of values.

    Args:
        values (list) - is a list of values. Assumes values is already sorted.
        percent (float) - a float value from 0.0 to 1.0.
    Returns:
        The percent of values, interpolated if necessary
    """
    if not values:
        return None
    split = (len(values) - 1) * percent
    split_lower = math.floor(split)
    split_upper = math.ceil(split)
    if split_lower == split_upper:
        return values[int(split)]
    # Otherwise, interpolate
    d0 = values[int(split_lower)] * (split_upper - split)
    d1 = values[int(split_upper)] * (split - split_lower)
    return d0 + d1
