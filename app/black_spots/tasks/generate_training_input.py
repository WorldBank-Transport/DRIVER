import logging
import csv
import os
import tempfile
from functools import partial
from dateutil import parser
from dateutil.relativedelta import relativedelta
import pyproj
import rtree
import pytz
import fiona
import tarfile
import shutil
from collections import namedtuple
from django.core.files import File

from celery import shared_task
from celery.utils.log import get_task_logger

from shapely.geometry import shape, Point
from shapely.ops import transform

from black_spots.models import (
    BlackSpotRecordsFile, RoadSegmentsShapefile, BlackSpotTrainingCsv, LoadForecastTrainingCsv
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()
logger = get_task_logger(__name__)

INTERSECTION_BUFFER_UNITS = int(os.getenv('INTERSECTION_BUFFER_UNITS', '5'))
MAX_LINE_UNITS = int(os.getenv('MAX_LINE_UNITS', '200'))
RECORD_PROJECTION = os.getenv('RECORD_PROJECTION', 'epsg:4326')
TIMEZONE = pytz.timezone(os.getenv('TIMEZONE', 'Asia/Manila'))
MATCH_TOLERANCE = int(os.getenv('MATCH_TOLERANCE', '5'))
RECORD_COL_ID = os.getenv('RECORD_COL_ID', 'record_id')
RECORD_COL_X = os.getenv('RECORD_COL_X', 'lon')
RECORD_COL_Y = os.getenv('RECORD_COL_Y', 'lat')
RECORD_COL_OCCURRED = os.getenv('RECORD_COL_OCCURRED', 'occurred_from')
RECORD_COL_SEVERE = os.getenv('RECORD_COL_SEVERE', 'Severity')
RECORD_COL_SEVERE_VALS = os.getenv('RECORD_COL_SEVERE_VALS', 'Fatal,Injury')
RECORD_COL_PRECIP = os.getenv('RECORD_COL_PRECIP', 'weather')
RECORD_COL_PRECIP_VALS = os.getenv('RECORD_COL_PRECIP_VALS', 'rain,hail,sleet,snow,thunderstorm,tornado')
TILE_MAX_UNITS = int(os.getenv('TILE_MAX_UNITS', '3000'))
COMBINED_SEGMENTS_SHP_NAME = os.getenv('COMBINED_SEGMENTS_SHP_NAME', 'combined_segments.shp')


@shared_task
def get_training_noprecip(segments_shp_uuid, records_csv_uuid, road_srid):
    """Generate training input without precipitation data

    Args:
    :param segments_tar_uuid: (str) UUID for the RoadSegmentsShapefile to use
    :param records_csv_uuid: (str) UUID for the BlackSpotRecordsFile
    :param road_srid: (int) EPSG code of Roads shapefile

    Returns:
    str: uuid for a BlackSpotTrainingCsv
    """
    records, segments, index, min_occurred, max_occurred = get_data(
        records_csv_uuid, segments_shp_uuid, road_srid
    )
    segments_with_records = match_records_to_segments(
        records, index, segments, MATCH_TOLERANCE
    )
    logger.info('Found {:,} segments with records'.format(len(segments_with_records)))

    schema, segments_with_data = get_segments_with_data(
        segments, segments_with_records, min_occurred, max_occurred
    )
    black_spot_training_uuid = write_black_spot_training_csv(segments_with_data, schema)
    logger.info('Generated csv for black spot training')
    return str(black_spot_training_uuid)


@shared_task
def get_training_precip(segments_shp_uuid, records_csv_uuid, road_srid):
    """Generate training input

    Args:
    :param segments_tar_uuid: (str) UUID for the RoadSegmentsShapefile to use
    :param records_csv_uuid: (str) UUID for the BlackSpotRecordsFile
    :param road_srid: (int) EPSG code of Roads shapefile

    Returns:
    str: uuid for a LoadForecastTrainingCsv
    """

    records, segments, index, min_occurred, max_occurred = get_data(
        records_csv_uuid, segments_shp_uuid, road_srid
    )

    records_with_precip = [record for record in records if record['precip']]
    segments_with_records_precip = match_records_to_segments(
        records_with_precip, index, segments, MATCH_TOLERANCE
    )
    logger.info('Found {:,} segments with records w/precip'.format(len(segments_with_records_precip)))

    records_without_precip = [record for record in records if not record['precip']]
    segments_with_records_no_precip = match_records_to_segments(
        records_without_precip, index, segments, MATCH_TOLERANCE)

    schema, segments_with_data_precip = get_segments_with_data(
        segments, segments_with_records_precip, min_occurred, max_occurred
    )
    _, segments_with_data_no_precip = get_segments_with_data(
        segments, segments_with_records_no_precip, min_occurred, max_occurred
    )

    load_forecast_schema = schema.copy()
    load_forecast_schema['properties']['precip'] = 'int'
    forecast_training_uuid = write_load_forecast_training_csv(
        segments_with_data_precip, segments_with_data_no_precip, load_forecast_schema
    )
    logger.info('Generated csv for load forecast training')
    return str(forecast_training_uuid)


def get_data(records_csv_uuid, segments_shp_uuid, road_srid):
    """Does all common data processing for the training file generation

    Reads in data from the records csv and segments shapefile and converts them into
    the appropriate data formats for use in the celery tasks

    Args:
    :param records_csv_uuid: (str) UUID for the RoadSegmentsShapefile to use
    :param segments_shp_uuid: (str) UUID for the BlackSpotRecordsFile to use
    :param road_srid: (int) EPSG code of Roads shapefile

    Returns:
    Data namedtuple: [
        records (dict list), segments (shapes), index (rtree),
        min_occurred (date), max_occurred (date)
    ]
    """
    with BlackSpotRecordsFile.objects.get(uuid=records_csv_uuid).csv as records_csv:
        records, min_occurred, max_occurred = read_records(
            records_csv, {'init': 'epsg:{}'.format(road_srid)}, {'init': RECORD_PROJECTION},
            TIMEZONE,
            RECORD_COL_ID, RECORD_COL_X, RECORD_COL_Y,
            RECORD_COL_OCCURRED, RECORD_COL_SEVERE, RECORD_COL_SEVERE_VALS,
            RECORD_COL_PRECIP, RECORD_COL_PRECIP_VALS
        )

    # segments shapefile
    shp_tar = RoadSegmentsShapefile.objects.get(uuid=segments_shp_uuid).shp_tgz.path

    tar_output_dir = tempfile.mkdtemp()
    try:
        # TODO: Extract only the combined segments file, not the entire tarball
        with tarfile.open(shp_tar, 'r:gz') as tar:
            def is_within_directory(directory, target):
                
                abs_directory = os.path.abspath(directory)
                abs_target = os.path.abspath(target)
            
                prefix = os.path.commonprefix([abs_directory, abs_target])
                
                return prefix == abs_directory
            
            def safe_extract(tar, path=".", members=None, *, numeric_owner=False):
            
                for member in tar.getmembers():
                    member_path = os.path.join(path, member.name)
                    if not is_within_directory(path, member_path):
                        raise Exception("Attempted Path Traversal in Tar File")
            
                tar.extractall(path, members, numeric_owner=numeric_owner) 
                
            
            safe_extract(tar, tar_output_dir)

        segments_path = os.path.join(tar_output_dir, 'segments', COMBINED_SEGMENTS_SHP_NAME)
        with fiona.open(segments_path) as segments:
            segments_index = rtree.index.Index()
            # Create a spatial index for segments to efficiently find nearby records
            seg_shapes = [shape(segment['geometry']) for segment in segments]

        for idx, element in enumerate(seg_shapes):
            segments_index.insert(idx, element.bounds)
    finally:
        shutil.rmtree(tar_output_dir)
    Data = namedtuple('Data', ['records', 'segments', 'index', 'min_occurred', 'max_occurred'])
    return Data(records, seg_shapes, segments_index, min_occurred, max_occurred)


def write_black_spot_training_csv(segments_with_data, schema):
    """Writes all segments containing record data to csv for black spot training
    :param segments_with_data: List of tuples containing segments and segment data
    :param schema: Schema to use for writing CSV
    """
    field_names = sorted(schema['properties'].keys())
    with tempfile.SpooledTemporaryFile() as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=field_names)
        csv_writer.writeheader()
        for segment_with_data in segments_with_data:
            _, data = segment_with_data
            if data['records'] > 0:
                csv_writer.writerow(data)
        # Reset file pointer to start so it can be read into a BlackspotTrainingCsv
        csv_file.seek(0, 0)
        training_csv = BlackSpotTrainingCsv.objects.create()
        training_csv.csv.save(str(training_csv.uuid)+'.csv', File(csv_file))

    return training_csv.uuid


def write_load_forecast_training_csv(segments_with_data_precip, segments_with_data_no_precip, schema):
    """Writes segments containing record data (with and without precip) to csv for load forecasting
    :param segments_with_data_precip: List of tuples containing segments and data (w/precip)
    :param segments_with_data_no_precip: List of tuples containing segments and data (no precip)
    :param schema: Schema to use for writing CSV
    """
    field_names = sorted(schema['properties'].keys())

    with tempfile.SpooledTemporaryFile() as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=field_names)
        csv_writer.writeheader()

        def write_data(data_list, precip_val):
            """Helper for writing out a list of data to the file
            :param data_list: List of tuples containing segments and data
            :param precip_val: Value to write out for the precip column
            """
            for segment_with_data in data_list:
                _, data = segment_with_data
                if data['records'] > 0:
                    data['precip'] = precip_val
                    csv_writer.writerow(data)

        write_data(segments_with_data_precip, 1)
        write_data(segments_with_data_no_precip, 0)

        # Reset file pointer to start so it can be read into a ForecastTrainingCsv
        csv_file.seek(0, 0)
        training_csv = LoadForecastTrainingCsv.objects.create()
        training_csv.csv.save(str(training_csv.uuid)+'.csv', File(csv_file))

    return training_csv.uuid


def read_records(records_file, road_projection, record_projection, tz, col_id, col_x, col_y,
                 col_occurred, col_severe, severe_vals, col_precip, precip_vals):
    """Reads records csv, projects points, and localizes datetimes
    :param records_csv: Path to CSV containing record data
    :param road_projection: Projection CRS for road data
    :param record_projection: Projection CRS for record data
    :param tz: Timezone id for record data
    :param col_id: Record id column name
    :param col_x: Record x-coordinate column name
    :param col_y: Record y-coordinate column name
    :param col_occurred: Record occurred datetime column name
    :param col_severe: Record severe column name
    :param severe_vals: List of string values indicating a severe record
    :param col_precip: Record precip column name
    :param precip_vals: List of string values indicating a record w/precipitation
    """

    # Create a function for projecting a point
    project = partial(
        pyproj.transform,
        pyproj.Proj(record_projection),
        pyproj.Proj(road_projection)
    )

    records = []
    min_occurred = None
    max_occurred = None
    records_file.open('rb')
    csv_reader = csv.DictReader(records_file)
    for row in csv_reader:
        # Collect min and max occurred datetimes, as they'll be used later on
        try:
            parsed_dt = parser.parse(row[col_occurred])

            # Localize datetimes that aren't timezone-aware
            occurred = parsed_dt if parsed_dt.tzinfo else tz.localize(parsed_dt)
        except:
            # Skip the record if it has an invalid datetime
            continue

        if not min_occurred or occurred < min_occurred:
            min_occurred = occurred
        if not max_occurred or occurred > max_occurred:
            max_occurred = occurred

        records.append({
            'id': row[col_id],
            'point': transform(project, Point(float(row[col_x]), float(row[col_y]))),
            'occurred': occurred,
            'severe': row[col_severe] in severe_vals if col_severe in row else False,
            'precip': row[col_precip] in precip_vals if col_precip in row else False
        })
    records_file.close()

    return records, min_occurred, max_occurred


def match_records_to_segments(records, segments_index, combined_segments, match_tolerance):
    """Matches up each record to its nearest segment
    :param records: List of record objects
    :param segments_index: rtree index of the records for faster searching
    :param combined_segments: List of Shapely objects representing road segments (+ intersections)
    :param match_tolerance: Number of units to buffer for checking a record/road match
    """
    segments_with_records = {}
    for record in records:
        record_point = record['point']
        # A record won't always be exactly on the line, so buffer the point
        # by the match tolerance units to capture nearby segments
        record_buffer_bounds = record_point.buffer(match_tolerance).bounds
        nearby_segments = segments_index.intersection(record_buffer_bounds)
        segment_id_with_distance = [
            (segment_id, combined_segments[segment_id].distance(record_point))
            for segment_id in nearby_segments
        ]

        if len(segment_id_with_distance):
            nearest = min(segment_id_with_distance, key=lambda tup: tup[1])
            segment_id = nearest[0]
            if segment_id not in segments_with_records:
                segments_with_records[segment_id] = []
            segments_with_records[segment_id].append(record)
    return segments_with_records


def get_segments_with_data(combined_segments, segments_with_records, min_occurred, max_occurred):
    """Adds calculated data to each segment
    :param combined_segments: List of Shapely objects representing road segments (+ intersections)
    :param segments_with_records: List of tuples containing record objects and segments
    :param min_occurred: Minimum occurred date of records
    :param max_occurred:  Maximum occurred date of records
    """

    # Define the schema used for writing to a shapefile (and a csv).
    # The schema is defined here, because we need to add some variable
    # properties to it later on in the function which is dependent on
    # the number of years of data available. It's also good to have it
    # here since the data being generated here needs to conform to this
    # schema, so a future edit will only involve modifying this function.
    # The reason for both the variable name lengths (e.g. 'inter') and the
    # types (e.g. int instead of bool) are due to shapefile limitations.
    schema = {
        'geometry': 'MultiLineString',
        'properties': {
            # Unique identifier for this segment
            'id': 'int',
            # Whether or not this is an intersection
            'inter': 'int',
            # Length of the segment
            'length': 'float',
            # Number of lines in the segment (measure of intersection complexity)
            'lines': 'int',
            # X-coordinate of segment centroid
            'pointx': 'float',
            # Y-coordinate of segment centroid
            'pointy': 'float',
            # Total number of records matched
            'records': 'int'
        }
    }

    # Figure out the number of full years of data we have so we can create offset aggregations.
    # A year is defined here as 52 weeks, in case we eventually want to do week/month aggregations.
    num_years = (max_occurred - min_occurred).days / (52 * 7)
    desired_years = 4
    if num_years < desired_years:  # The R script expects at least 4 years of data
        logger.info('Fewer than 4 years of data found; outputting zeroes for extra years')
        diff = desired_years - num_years
        num_years = desired_years
        min_occurred = min_occurred - relativedelta(years=diff)

    # Create the set of year ranges
    year_ranges = [
        (max_occurred - relativedelta(years=offset),
         max_occurred - relativedelta(years=(offset + 1)),
         't{}notsev'.format(offset),
         't{}severe'.format(offset))
        for offset in range(num_years)
    ]

    # Add fields to the schema for each year range
    for year_range in year_ranges:
        _, _, records_label, severe_label = year_range
        # Number of records within the offset period
        schema['properties'][records_label] = 'int'
        # Number of severe records within the offset period
        schema['properties'][severe_label] = 'int'

    segments_with_data = []
    for idx, segment in enumerate(combined_segments):
        is_intersection = 'MultiLineString' == segment.type
        records = segments_with_records.get(idx)
        data = {
            'id': idx,
            'inter': 1 if is_intersection else 0,
            'length': segment.length,
            'lines': len(segment) if is_intersection else 1,
            'pointx': segment.centroid.x,
            'pointy': segment.centroid.y,
            'records': len(records) if records else 0
        }

        # Add time offset aggregation data
        for year_range in year_ranges:
            max_occurred, min_occurred, notsev_label, severe_label = year_range
            if records:
                records_in_range = [
                    record for record in records
                    if min_occurred < record['occurred'] <= max_occurred
                ]
                severe_records_in_range = [
                    record for record in records_in_range
                    if record['severe']
                ]
                num_severe = len(severe_records_in_range)
                data[severe_label] = num_severe
                data[notsev_label] = len(records_in_range) - num_severe
            else:
                data[severe_label] = 0
                data[notsev_label] = 0

        segments_with_data.append((segment, data))

    return (schema, segments_with_data)
