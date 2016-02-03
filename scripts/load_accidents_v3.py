#!/usr/bin/env python

"""Loads accidents from multiple accident database dumps (schema v3)"""
import argparse
import csv
from dateutil import parser
import glob
import logging
import json
import os
from osgeo import ogr, osr
import pytz
from time import sleep
import uuid

import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()


def extract(csv_path):
    """Simply pulls rows into a DictReader"""
    with open(csv_path) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
        for row in reader:
            yield row


def transform(record, schema_id):
    """Converts denormalized rows into objects compliant with the schema.

    Doesn't do anything fancy -- if the schema changes, this needs to change too.
    """
    details_mapping = {
        'severity': 'Severity',
        'description': 'Description',
        'num_vehicles': 'Num vehicles',
        'num_driver_casualties': 'Num driver casualties',
        'num_passenger_casualties': 'Num passenger casualties',
        'num_pedestrian_casualties': 'Num pedestrian casualties',
        'traffic_control': 'Traffic control',
        'collision_type': 'Collision type',
        'street_lights': 'Street lights',
        'surface_condition': 'Surface condition',
        'surface_type': 'Surface type',
        'main_cause': 'Main cause'
    }
    obj = {
        'data': {
            'accidentDetails': dict(),
            'person': [],
            'vehicle': []
        },
        'schema': str(schema_id),
        'occurred_from': 'None',
        'occurred_to': 'None',
        'geom': 'POINT (0 0)'
    }
    data = obj['data']
    for key, value in details_mapping.iteritems():
        if key in record:
            data['accidentDetails'][value] = record[key]

    # Add in the _localId field; they're not used here but the schema requires them
    def _add_local_id(dictionary):
        dictionary['_localId'] = str(uuid.uuid4())

    _add_local_id(data['accidentDetails'])

    # Set the occurred_from/to fields
    occurred_date = parser.parse(record['record_date'])
    occurred_date = pytz.timezone('Asia/Manila').localize(occurred_date)
    obj['occurred_from'] = occurred_date.isoformat()
    obj['occurred_to'] = occurred_date.isoformat()

    # Set the geom field
    point = ogr.Geometry(ogr.wkbPoint)

    # Some of the files use lat/lon, others use 3123.
    # Reproject the ones that don't look like lat/lon.
    if -180 < float(record['lon']) < 180:
        point.AddPoint(float(record['lon']), float(record['lat']))
        point.FlattenTo2D()
    else:
        point.AddPoint(int(record['lon']), int(record['lat']))
        point.FlattenTo2D()

        source = osr.SpatialReference()
        source.ImportFromEPSG(3123)

        target = osr.SpatialReference()
        target.ImportFromEPSG(4326)

        transform = osr.CoordinateTransformation(source, target)
        point.Transform(transform)

    obj['geom'] = point.ExportToWkt()
    return obj


def load(obj, api, headers=None):
    """Load a transformed object into the data store via the API"""
    if headers is None:
        headers = {}
    response = requests.post(api + '/records/',
                             data=json.dumps(obj),
                             headers=dict({'content-type': 'application/json'}.items() +
                                          headers.items()))
    sleep(0.2)
    if response.status_code != 201:
        logger.error(response.text)
        logger.error('retrying...')
        load(obj, api, headers)


def create_schema(schema_path, api, headers=None):
    """Create a recordtype/schema into which to load all new objects"""
    # Create record type
    response = requests.post(api + '/recordtypes/',
                             data={'label': 'Accident',
                                   'plural_label': 'Accidents',
                                   'description': 'Historical accident data',
                                   'active': True},
                             headers=headers)
    response.raise_for_status()
    rectype_id = response.json()['uuid']
    logger.info('Created RecordType')
    # Create associated schema
    with open(schema_path, 'r') as schema_file:
        schema_json = json.load(schema_file)
        response = requests.post(api + '/recordschemas/',
                                 data=json.dumps({u'record_type': rectype_id,
                                                  u'schema': schema_json}),
                                 headers=dict({'content-type': 'application/json'}.items() +
                                              headers.items()))
    logger.debug(response.json())
    response.raise_for_status()
    logger.info('Created RecordSchema')
    return response.json()['uuid']


def main():
    parser = argparse.ArgumentParser(description='Load accidents data (v3)')
    parser.add_argument('accidents_csv_dir', help='Path to directory containing accidents CSVs')
    parser.add_argument('--schema-path', help='Path to JSON file defining schema',
                        default=os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                             'accident_schema_v3.json'))
    parser.add_argument('--api-url', help='API host / path to target for loading data',
                        default='http://localhost:7000/api')
    parser.add_argument('--authz', help='Authorization header')
    args = parser.parse_args()

    headers = None

    if args.authz:
        headers = {'Authorization': args.authz}

    # Do the work
    schema_id = create_schema(args.schema_path, args.api_url, headers)
    logger.info("Loading data")
    count = 1

    # Load all files in the directory, ordered by file size
    files = sorted(glob.glob(args.accidents_csv_dir + '/*.csv'), key=os.path.getsize)
    logger.info("Files to process: {}".format(files))

    for csv_file in files:
        logger.info("Loading file: {}".format(csv_file))
        for record in extract(csv_file):
            if count % 100 == 0:
                logger.info("{0} (file {1} of {2})".format(
                    count, files.index(csv_file) + 1, len(files)))
            load(transform(record, schema_id), args.api_url, headers)
            count += 1
    logger.info('Loading complete')


if __name__ == '__main__':
    main()
