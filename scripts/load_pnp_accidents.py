"""Loads accidents from a PNP Accidents database dump"""
import argparse
import csv
import datetime
import logging
import json
import os
from osgeo import osr, ogr
import uuid

import pytz
import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()


def extract(csv_path):
    """Simply pulls rows into a DictReader"""
    with open(csv_path) as csvfile:
        reader = csv.DictReader(csvfile, delimiter='|')
        for row in reader:
            yield row


def transform(record, schema_id):
    """Converts denormalized rows into objects compliant with the schema.

    Doesn't do anything fancy -- if the schema changes, this needs to change too.
    """
    blackspot_keys = set(['blackspot_,n,16,0', 'blackspot_1,n,16,0',
                         'blackspot_2,n,16,0', 'blackspot_3,n,16,0'])
    details_mapping = {
        'accident_n,c,15': 'Accident number',
        'accident_d,d': 'Date',
        'police_sta,c,25': 'Police station number',
        'num_vehicl,n,16,0': 'Number of vehicles',
        'num_driver,n,16,0': 'Number of drivers',
        'num_pass_c,n,16,0': 'Number of passengers',
        'num_ped_ca,n,16,0': 'Number of pedestrians',
        'severity,c,1': 'Severity',
        'junction_t,c,2': 'Junction type',
        'weather,c,2': 'Weather type',
        'light,c,2': 'Lighting conditions',
        'surface_co,c,2': 'Surface conditions',
        'main_cause,c,2': 'Main cause',
        'hit_run,c,2': 'Hit and run',
        'num_killed,n,16,0': 'Number killed',
        'num_seriou,n,16,0': 'Number seriously injured',
        'num_minor,n,16,0': 'Number with minor injuries',
        'num_notinj,n,16,0': 'Number not injured',
        'record_dat,d': 'Record date',
        'police_des,c,255': 'Police description'
    }
    site_mapping = {
        'site_id,n,16,0': 'ID',
        'site_type,c,1': 'Type',
        'x,n,16,0': 'X coordinate (as entered)',
        'y,n,16,0': 'Y coordinate (as entered)',
        'road_secti,c,8': 'Road section ID',
        'chainage,n,16,0': 'Chainage',
        'descriptio,c,128': 'Description',
        'road_name1,c,50': 'Road name',
        'eng_distri,c,35': 'Engineering district name',
        'eng_distri1,c,35': 'Engineering district ID',
        'dpwh_regio,c,35': 'DPWH region name',
        'dpwh_regio1,c,35': 'DPWH region ID',
        'dpwh_prov,c,35': 'DPWH province name',
        'dpwh_prov_,n,16,0': 'DPWH province ID',
        'section_le,n,16,0': 'Section length',
        'road_sub_c,c,75': 'Road sub-category',

    }
    obj = {
        'data': {
            'Black spot': [],
            'Site': dict(),
            'Accident Details': dict(),
        },
        'schema': str(schema_id),
        'slug': 'removeme',  # TODO: Remove when removed from Record class.
        'label': 'removeme',
        'occurred_from': 'None',
        'occurred_to': 'None',
        'geom': 'POINT (0 0)'
    }
    data = obj['data']  # Reduce typing
    # We're not using every field so save a little time by iterating over only
    # the ones we want.
    for key, value in details_mapping.iteritems():
        data['Accident Details'][value] = record[key]
    for key, value in site_mapping.iteritems():
        data['Site'][value] = record[key]
    for key in blackspot_keys:
        if record[key] != '0':
            data['Black spot'].append(dict(ID=record[key]))

    # Add in the _localId field; they're not used here but the schema requires them
    def _add_local_id(dictionary):
        dictionary['_localId'] = str(uuid.uuid4())

    _add_local_id(data['Accident Details'])
    _add_local_id(data['Site'])
    for black_spot in data['Black spot']:
        _add_local_id(black_spot)

    # Set the occurred_from/to fields
    occurred_date = datetime.datetime.strptime(record['accident_d,d'], '%m/%d/%y')
    # TODO: The time field is broken; set everything to 12PM; remove if this is ever fixed
    occurred_date += datetime.timedelta(hours=12)
    occurred_date = pytz.timezone('Asia/Manila').localize(occurred_date)
    obj['occurred_from'] = occurred_date.isoformat()
    obj['occurred_to'] = occurred_date.isoformat()

    # Set the geom field
    point = ogr.Geometry(ogr.wkbPoint)
    point.AddPoint(int(record['x,n,16,0']), int(record['y,n,16,0']))
    point.FlattenTo2D()

    source = osr.SpatialReference()  # SRID used by PNP data
    source.ImportFromEPSG(3123)

    target = osr.SpatialReference()
    target.ImportFromEPSG(3857)

    transform = osr.CoordinateTransformation(source, target)

    point.Transform(transform)
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
    parser = argparse.ArgumentParser(description='Load PNP accidents data')
    parser.add_argument('accidents_csv_path', help='Path to CSV containing accidents data')
    parser.add_argument('--schema-path', help='Path to JSON file defining schema',
                        default=os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                             'pnp_accident_schema.json'))
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
