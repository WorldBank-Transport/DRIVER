#!/usr/bin/env python

"""Loads incidents from CSV data"""
import csv
from dateutil import parser
import glob
import logging
import os
import pytz
import uuid

from grout.models import RecordSchema
from data.models import DriverRecord

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

# Adjust schema_id in main()


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
            'driverIncidentDetails': dict(),
            'driverPerson': [],
            'driverVehicle': []
        },
        'schema': str(schema_id),
        'occurred_from': 'None',
        'occurred_to': 'None',
        'geom': 'POINT (0 0)'
    }
    data = obj['data']

    # Skip if no date
    if not record['record_date']:
        return

    for key, value in details_mapping.iteritems():
        if key in record:
            data['driverIncidentDetails'][value] = record[key]
    data['driverIncidentDetails']['Location Approximate'] = 'Yes'
    data['driverIncidentDetails']['Reporting Agency'] = 'MMDA Road Safety Unit'

    # Add in the _localId field; they're not used here but the schema requires them
    def _add_local_id(dictionary):
        dictionary['_localId'] = str(uuid.uuid4())

    _add_local_id(data['driverIncidentDetails'])

    # Set the occurred_from/to fields
    occurred_date = parser.parse(record['record_date'])
    occurred_date = pytz.timezone('Asia/Manila').localize(occurred_date)
    obj['occurred_from'] = occurred_date.isoformat()
    obj['occurred_to'] = occurred_date.isoformat()

    obj['geom'] = 'POINT ({} {})'.format(float(record['lon']), float(record['lat']))

    # Add vehicles
    mode = [x.strip() for x in record['mode'].split(',')]
    modes_with_count = [x.split(' ') for x in mode]
    try:
        modes_with_count = [[int(float(x[0])), x[1]] for x in modes_with_count]
    except ValueError:  # If count data is bad just return what we have
        return obj
    modes_with_count = [x for x in modes_with_count if x[0]]
    mode_map = {
        'car': 'Car',
        'bus': 'Bus',
        'jeepney': 'Jeepney',
        'truck': 'Truck (Unknown)',
        'van': 'Van',
        'motorcycle': 'Motorcycle',
        'tricycle': 'Tricycle',
        'bike_or_pedicab': 'Bicyle',
        'train': 'Heavy Equipment',
        'kalesa': 'Horse-Driven Carriage (Tartanilla)',
        'pushcart': 'Push-Cart'
    }

    if len(modes_with_count):
        for mode_with_count in modes_with_count:
            count = mode_with_count[0]
            mode = mode_with_count[1]
            for i in range(count):
                obj['data']['driverVehicle'].append({
                    'Vehicle type': mode_map[mode],
                    '_localId': str(uuid.uuid4())
                })

    return obj


def load(obj, schema, headers=None):
    """Load a transformed object into the data store"""
    if not obj:
        return

    if headers is None:
        headers = {}

    DriverRecord.objects.create(
        occurred_from=obj['occurred_from'],
        occurred_to=obj['occurred_to'],
        geom=obj['geom'],
        schema=schema,
        data=obj['data']
    )


def main():
    headers = None

    # Do the work
    schema_id = '95f0e797-04e5-404c-9e41-1c3ea1a5d2de'
    schema = RecordSchema.objects.get(uuid=schema_id)
    logger.info("Loading data")
    count = 1

    # Load all files in the directory, ordered by file size
    files = sorted(glob.glob('batch/*.csv'), key=os.path.getsize)
    logger.info("Files to process: {}".format(files))

    for csv_file in files:
        logger.info("Loading file: {}".format(csv_file))
        for record in extract(csv_file):
            if count % 100 == 0:
                logger.info("{0} (file {1} of {2})".format(
                    count, files.index(csv_file) + 1, len(files)))
            load(transform(record, schema_id), schema, headers)
            count += 1
    logger.info('Loading complete')


if __name__ == '__main__':
    main()
