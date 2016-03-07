"""Loads mock interventions data"""
import argparse
from datetime import datetime
import logging
import geojson
import json
import requests
import sys
import os
import uuid

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()


def read_interventions(input_path):
    """Reads the input geojson file of interventions"""
    with open(input_path) as geojson_file:
        try:
            interventions_geojson = geojson.load(geojson_file)
        except Exception:
            logger.exception('Error parsing interventions GeoJSON file:')
            sys.exit()

        interventions = interventions_geojson['features']
        logger.info('number of interventions to load: {}'.format(len(interventions)))

        # If there are no interventions to load from the file, exit the application
        if not len(interventions):
            logger.info('no interventions to load, exiting')
            sys.exit()

        return interventions


def load(record, api, headers=None):
    """Load an object into the data store via the API"""
    if headers is None:
        headers = {}
    response = requests.post(api + '/records/',
                             data=json.dumps(record),
                             headers=dict({'content-type': 'application/json'}.items() +
                                          headers.items()))
    if response.status_code != 201:
        logger.error(response.text)
    response.raise_for_status()


def transform(record, schema_id):
    """Converts records into objects compliant with the schema.

    Doesn't do anything fancy -- if the schema changes, this needs to change too.
    """

    obj = {
        'data': {
            'interventionDetails': dict(),
        },
        'schema': str(schema_id),
        'occurred_from': 'None',
        'occurred_to': 'None',
        'geom': 'POINT (0 0)'
    }

    data = obj['data']
    data['interventionDetails']['Type'] = record['properties']['Type']

    # Add in the _localId field; they're not used here but the schema requires them
    def _add_local_id(dictionary):
        dictionary['_localId'] = str(uuid.uuid4())

    _add_local_id(data['interventionDetails'])

    # Set the occurred_from/to fields
    # TODO: change from temporarily saving current time
    obj['occurred_from'] = datetime.now().isoformat()
    obj['occurred_to'] = datetime.now().isoformat()

    # Set the geom field
    obj['geom'] = record['geometry']

    return obj


def create_schema(schema_path, api, headers=None):
    """Create a recordtype/schema into which to load all new objects"""
    response = requests.get(api + '/recordtypes/?label=Intervention&active=True', headers=headers)
    response.raise_for_status()
    results = response.json()['results']
    try:
        rectype_id = results[0]['uuid']
        logger.info('Loaded RecordType')
    except IndexError:
        # Create record type
        response = requests.post(api + '/recordtypes/',
                                 data={'label': 'Intervention',
                                       'plural_label': 'Interventions',
                                       'description': 'Actions to improve traffic safety',
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
    logger.warn('Schema creation response: %s', response.json())
    response.raise_for_status()
    logger.info('Created RecordSchema')
    return response.json()['uuid']


def main():
    """Main entry point for the script"""
    parser = argparse.ArgumentParser(description='Load mock interventions data')
    parser.add_argument('geojson_input_path', help='Path to geojson file containing mock interventions')
    parser.add_argument('--schema-path', help='Path to geoJSON file defining schema',
                        default=os.path.join(os.path.dirname(os.path.realpath(__file__)), 'interventions_schema.json'))
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
    interventions = read_interventions(args.geojson_input_path)
    for intervention in interventions:
        logger.warn(intervention)
        load(transform(intervention, schema_id), args.api_url, headers)

    logger.info('Loading interventions complete')


if __name__ == '__main__':
    main()
