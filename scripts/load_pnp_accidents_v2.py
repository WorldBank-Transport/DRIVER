"""Loads accidents from a PNP Accidents database dump (schema v2)"""
import argparse
import csv
from dateutil import parser
import logging
import json
import os
from osgeo import ogr
import uuid

import pytz
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
        'description': 'Description'
    }
    obj = {
        'data': {
            'Accident Details': dict(),
            'Vehicle': dict(),
        },
        'schema': str(schema_id),
        'slug': 'removeme',  # TODO: Remove when removed from Record class.
        'label': 'removeme',
        'occurred_from': 'None',
        'occurred_to': 'None',
        'geom': 'POINT (0 0)'
    }
    data = obj['data']
    for key, value in details_mapping.iteritems():
        data['Accident Details'][value] = record[key]

    # Add in the _localId field; they're not used here but the schema requires them
    def _add_local_id(dictionary):
        dictionary['_localId'] = str(uuid.uuid4())

    _add_local_id(data['Accident Details'])

    # Set the occurred_from/to fields
    occurred_date = parser.parse(record['record_date'])
    obj['occurred_from'] = occurred_date.isoformat()
    obj['occurred_to'] = occurred_date.isoformat()

    # Set the geom field
    point = ogr.Geometry(ogr.wkbPoint)
    point.AddPoint(float(record['lon']), float(record['lat']))
    point.FlattenTo2D()

    obj['geom'] = point.ExportToWkt()
    return obj


def load(obj, api):
    """Load a transformed object into the data store via the API"""
    response = requests.post(api + '/records/',
                             data=json.dumps(obj),
                             headers={'content-type': 'application/json'})
    if response.status_code != 201:
        logger.error(response.text)
    response.raise_for_status()


def create_schema(schema_path, api):
    """Create a recordtype/schema into which to load all new objects"""
    # Create record type
    response = requests.post(api + '/recordtypes/',
                             data={'label': 'Accident',
                                   'plural_label': 'Accidents',
                                   'description': 'Historical PNP data',
                                   'active': True})
    response.raise_for_status()
    rectype_id = response.json()['uuid']
    logger.info('Created RecordType')
    # Create associated schema
    with open(schema_path, 'r') as schema_file:
        schema_json = json.load(schema_file)
        response = requests.post(api + '/recordschemas/',
                                 data=json.dumps({u'record_type': rectype_id,
                                                  u'schema': schema_json}),
                                 headers={'content-type': 'application/json'})
    logger.debug(response.json())
    response.raise_for_status()
    logger.info('Created RecordSchema')
    return response.json()['uuid']


def main():
    parser = argparse.ArgumentParser(description='Load PNP accidents data (v2)')
    parser.add_argument('accidents_csv_path', help='Path to CSV containing accidents data')
    parser.add_argument('--schema-path', help='Path to JSON file defining schema',
                        default=os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                             'pnp_accident_schema_v2.json'))
    parser.add_argument('--api-url', help='API host / path to target for loading data',
                        default='http://localhost:7000/api')
    args = parser.parse_args()

    # Do the work
    schema_id = create_schema(args.schema_path, args.api_url)
    logger.info("Loading data")
    count = 1
    for record in extract(args.accidents_csv_path):
        if count % 100 == 0:
            logger.info(count)
        load(transform(record, schema_id), args.api_url)
        count += 1
    logger.info('Loading complete')


if __name__ == '__main__':
    main()
