#!/usr/bin/env python

"""Loads incidents from multiple incident database dumps (schema v3)"""
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
    details_mapping = [
        ('severity', 'Severity', str),
        ('description', 'Description', str),
        ('num_vehicles', 'Num vehicles', int),
        ('num_driver_casualties', 'Num driver casualties', int),
        ('num_passenger_casualties', 'Num passenger casualties', int),
        ('num_pedestrian_casualties', 'Num pedestrian casualties', int),
        ('traffic_control', 'Traffic control', str),
        ('collision_type', 'Collision type', str),
        ('street_lights', 'Street lights', str),
        ('surface_condition', 'Surface condition', str),
        ('surface_type', 'Surface type', str),
        ('main_cause', 'Main cause', str)
    ]

    # Calculate value for the occurred_from/to fields in local time
    occurred_date = parser.parse(record['record_date'])
    occurred_date = pytz.timezone('Asia/Manila').localize(occurred_date)

    # Set the geom field
    # Some of the files use lat/lon, others use 3123.
    # Reproject the ones that don't look like lat/lon.
    point = ogr.Geometry(ogr.wkbPoint)
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

    obj = {
        'data': {
            'driverIncidentDetails': {
                driver_key: cast_func(record[csv_key])
                for csv_key, driver_key, cast_func in details_mapping
                if csv_key in record
            },
            'driverPerson': [],
            'driverVehicle': []
        },
        'schema': str(schema_id),
        'occurred_from': occurred_date.isoformat(),
        'occurred_to': occurred_date.isoformat(),
        'geom': point.ExportToWkt()
    }

    # Add in the _localId field; they're not used here but the schema requires them
    obj['data']['driverIncidentDetails']['_localId'] = str(uuid.uuid4())

    return obj


def load(obj, api, headers=None):
    """Load a transformed object into the data store via the API"""
    if headers is None:
        headers = {}

    url = api + '/records/'
    data = json.dumps(obj)
    headers = dict(headers)
    headers.setdefault('content-type', 'application/json')

    while True:
        response = requests.post(url, data=data, headers=headers)
        sleep(0.2)
        if response.status_code == 201:
            return
        else:
            logger.error(response.text)
            logger.error('retrying...')


def create_record_type(api, headers=None):
    # Create record type
    response = requests.post(api + '/recordtypes/',
                             data={'label': 'Incident',
                                   'plural_label': 'Incidents',
                                   'description': 'Historical incident data',
                                   'temporal': True,
                                   'active': True},
                             headers=headers)
    response.raise_for_status()
    return response.json()['uuid']


def create_schema(schema_path, api, record_type_id, headers=None):
    """Create a RecordSchema into which to load all new objects"""
    # Create associated schema
    with open(schema_path, 'r') as schema_file:
        schema_json = json.load(schema_file)
        response = requests.post(api + '/recordschemas/',
                                 data=json.dumps({u'record_type': record_type_id,
                                                  u'schema': schema_json}),
                                 headers=dict({'content-type': 'application/json'}.items() +
                                              headers.items()))
    logger.debug(response.json())
    response.raise_for_status()
    return response.json()['uuid']


def main():
    parser = argparse.ArgumentParser(description='Load incidents data (v3)')
    parser.add_argument('incidents_csv_dir', help='Path to directory containing incidents CSVs')
    parser.add_argument('--schema-path', help='Path to JSON file defining schema',
                        default=os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                             'incident_schema_v3.json'))
    parser.add_argument('--api-url', help='API host / path to target for loading data',
                        default='http://localhost:7000/api')
    parser.add_argument('--authz', help='Authorization header')
    parser.add_argument('--schema-id', help='UUID for the Record Type schema to use')
    parser.add_argument('--record-type-id', help='UUID for the Record Type to use')
    args = parser.parse_args()

    headers = None

    if args.authz:
        headers = {'Authorization': args.authz}
    else:
        logger.info("No authorization token provided")

    # Do the work
    schema_id = args.schema_id
    if not schema_id:
        record_type_id = args.record_type_id
        if not record_type_id:
            logger.info("No Record Type ID, creating new Record Type in 2s")
            sleep(2)
            logger.info("Creating new Record Type...")
            record_type_id = create_record_type(args.api_url, headers)
            logger.info("Record Type created, ID is {}".format(record_type_id))

        logger.info("No schema ID, creating new schema in 2s")
        sleep(2)
        logger.info("Creating new schema...")
        schema_id = create_schema(args.schema_path, args.api_url, record_type_id, headers)
        logger.info("Schema created, ID is {}".format(schema_id))
    logger.info("Loading data")
    count = 1

    # Load all files in the directory, ordered by file size
    files = sorted(glob.glob(args.incidents_csv_dir + '/*.csv'), key=os.path.getsize)
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
