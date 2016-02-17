#!/usr/bin/env python

"""Combines a CSV of black spot predictions with road segments to output blackspot geometries

The modeling outputs a CSV containing blackspots and a geometry ID corresponding to the 'id' column
in the combined segments shapefile. To visualize this or load it into the DRIVER web app, this
script recombines the detected blackspots with the corresponding road segment geometries.
"""
import argparse
import csv
import logging
import os

import fiona

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()


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


def join_spots_to_segments(black_spots, segments_shp):
    """Output features for each black spot record.

    Joins each black spot record to the geometry of the appropriate segment.
    Args:
        black_spots (list): A list of blackspot records, as dicts
        segments_shp (string): Path to road segments shapefile
    Returns:
        List of black spot features
    """
    spot_features = []
    with fiona.open(segments_shp, 'r') as source:
        for spot in black_spots:
            index = int(spot['id'])
            feature = source[index]
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


def main():
    """Read command-line arguments and orchestrate processing"""
    parser = argparse.ArgumentParser(description='Generate black spots geometries')

    # Required arguments
    parser.add_argument('segments_shp', help='Path to shapefile of segments used for training')
    parser.add_argument('black_spots_csv', help='Path to CSV containing black spot model output')

    # Optional arguments
    parser.add_argument('--output-dir', help='Directory where files are output', default='.')
    parser.add_argument('--output-shapefile', help='Name of output shapefile',
                        default='blackspots.shp')
    parser.add_argument('--output-json-file', help='Name of output GeoJSON file',
                        default='blackspots.json')

    args = parser.parse_args()

    logger.info('Reading black spots...')
    black_spots = read_black_spots(args.black_spots_csv)

    logger.info('Creating black spot geometries...')
    black_spot_features = join_spots_to_segments(black_spots, args.segments_shp)

    # Detect new columns between shapefile and CSV; these need to get added to the output geometries
    logger.info('Detecting output parameters...')
    output_schema, output_crs = construct_output_params(args.segments_shp, args.black_spots_csv)

    logger.info('Writing black spot shapefile...')
    shapefile_out_path = os.path.join(args.output_dir, args.output_shapefile)
    write_features(black_spot_features, shapefile_out_path, output_schema,
                   'ESRI Shapefile', output_crs)

    logger.info('Writing black spot JSON...')
    json_out_path = os.path.join(args.output_dir, args.output_json_file)
    write_features(black_spot_features, json_out_path, output_schema,
                   'GeoJSON', output_crs)

    logger.info('Done.')

if __name__ == '__main__':
    main()
