#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Loads incidents from multiple incident database dumps (schema v3)"""
from contextlib import contextmanager
from itertools import groupby
from collections import defaultdict
from datetime import datetime, timedelta
import argparse
import re
import csv
from dateutil import parser
import logging
import json
import os
import pytz
from time import sleep
import uuid

import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()
time_regex = re.compile(r'[\d]+:[\d]+(:[\d]+)?')


@contextmanager
def open_many(file_paths, mode='r'):
    # Allows opening arbitrary number of files in a single context manager
    handlers = {path: open(path, mode) for path in file_paths}
    try:
        yield handlers
    finally:
        for fp in handlers.values():
            fp.close()


def merge_sort_files(paths, join_col):
    # Merges multiple inputs into a stream of ordered tuples of the format (id, source, row)
    with open_many(paths, 'r') as handlers:
        readers = {key: csv.DictReader(fp) for key, fp in handlers.items()}

        lines = {}
        for key, reader in readers.items():
            try:
                lines[key] = next(reader)
            except StopIteration:
                # If the file has no rows, ignore it
                pass
        # Loop over all open files until we've removed them all
        while lines:
            # Find the lowest ID in any of the open files
            join_id = min(line[join_col] for line in lines.values())
            for key in lines.keys():
                line = lines[key]
                while line[join_col] == join_id:
                    # If the ID matches, send it up and then read the next line from the file
                    yield (join_id, key, line)
                    try:
                        line = next(readers[key])
                        lines[key] = line
                    except StopIteration:
                        # We've reached the end of this file, remove the file from consideration
                        del lines[key]
                        break


def collate_multiple_files(paths, join_col):
    merged_stream = merge_sort_files(paths, join_col)

    # Merge the sorted stream of rows into dictionaries per unique ID
    for id, matches in groupby(merged_stream, lambda row: row[0]):
        result = defaultdict(list)
        for id, key, line in matches:

            # Add in the _localId field
            line['_localId'] = str(uuid.uuid4())

            result[key].append(line)
        yield result


def extract(csv_path):
    """Simply pulls rows into a DictReader"""
    with open(csv_path) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
        for row in reader:
            yield row


def format_record_object(data, mapping):
    output = {}
    for driver_key, csv_key, cast_func in mapping:
        try:
            value = data[csv_key]
        except KeyError:
            continue
        if value == 'NULL' or (value == 'N' and cast_func == int):
            # Ignore all NULL values
            continue
        try:
            output[driver_key] = cast_func(value)
        except Exception:
            logger.info('Failed to convert {} value "{}" with {}'.format(
                driver_key, value, cast_func))
            pass

    return output


def get_uuid_lookup_func(data, id_col):
    return lambda val: next(row['_localId'] for row in data if row[id_col] == val)


def get_value_map_func(mapping):
    return lambda val: mapping[val]


def trim_str(val):
    return str(val).strip()


def construct_record_data(record, persons, vehicles):
    return {
        'driverAcidenteDetails': format_record_object(record, [
            ('_localId', '_localId', str),
            ('CdAcidente', 'CdAcidente', int),
            ('Data', 'Data', str),  # Needed?
            ('Hora', 'Hora', str),  # Needed?
            ('Latitude', 'Latitude', float),  # Needed?
            ('Longitude', 'Longitude', float),  # Needed?
            ('CdLogradouro', 'CdLogradouro', int),
            #('NumLog', '', int),  # What does this correspond to?
            #('', 'Numero', int),  # What field is this?
            ('CdReferencia', 'CodReferencia', str),
            ('CdLogTransversal1', 'Log1', int),
            ('CdLogTransversal2', 'Log2', int),
            ('CdIntersecao', 'CodIntersecao', int),
            ('Jurisdicao', 'Jurisdicao', get_value_map_func({
                'F': 'Federal',
                'E': 'Estadual',
                'M': 'Municipal'
            })),
            ('CdNatureza', 'CodNatureza', str),
            ('CdTipoCruzamento', 'TipoCruzamento', str),
            ('INTERSECAO', 'INTERSEÇÃO?', get_value_map_func({
                'NAO': 'Não',
                'SIM': 'Sim'
            })),
            ('Natureza', 'Natureza', trim_str)
        ]),
        'driverVíTima': [format_record_object(person,  [
            ('_localId', '_localId', str),
            ('CdAcidente', 'CdAcidente', lambda _: record['_localId']),
            ('CdPessoa', 'CdPessoa', int),
            ('CdGravidadeLesao', 'CdGravidadeLesao', str),
            ('Sexo', 'Sexo', trim_str),
            ('TipoPessoa', 'TipoPessoa', int),
            ('CdVeículo', 'CdVeiculo', get_uuid_lookup_func(vehicles, 'CdVeiculo')),
            ('Idade', 'Idade', int)
        ]) for person in persons],
        'driverVeíCulo': [format_record_object(vehicle,  [
            ('_localId', '_localId', str),
            ('CdAcidente', 'CdAcidente', lambda _: record['_localId']),
            ('CdVeiculo', 'CdVeiculo', int),
            ('Ano', 'Ano', int),
            ('TipoVeiculo', 'TipoVeiculo', trim_str),
            ('Linha', 'Linha', int)
        ]) for vehicle in vehicles]
    }


def transform(record, vehicles, people, schema_id):
    """Converts denormalized rows into objects compliant with the schema.

    Doesn't do anything fancy -- if the schema changes, this needs to change too.
    """

    # Calculate value for the occurred_from/to fields in local time
    occurred_date = parser.parse('{date} {time}'.format(
        date=record['Data'],
        time=record['Hora'] if time_regex.match(record['Hora']) else ''
    ))
    occurred_date = pytz.timezone('America/Sao_Paulo').localize(occurred_date)

    # Set the geom field
    geom = "POINT ({lon} {lat})".format(
        lon=float(record['Longitude']),
        lat=float(record['Latitude'])
    )

    obj = {
        'data': construct_record_data(record, people, vehicles),
        'schema': str(schema_id),
        'occurred_from': occurred_date.isoformat(),
        'occurred_to': occurred_date.isoformat(),
        'geom': geom
    }

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
        sleep(0.2)
        response = requests.post(url, data=data, headers=headers)
        try:
            response.raise_for_status()
        except Exception:
            logger.warn("Error loading record")
            logger.error(response.text)
            if response.status_code >= 500:
                logger.error('retrying...')
            else:
                logger.info("Object: {}".format(json.dumps(obj)))
                raise
        else:
            return


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
    """Create a recordtype/schema into which to load all new objects"""
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

    # Load all files in the directory, ordered by file size
    files = {
        'record': 'acidentes.csv',
        'vehicles': 'veiculos.csv',
        'people': 'vitimas.csv'
    }

    logger.info("Importing records")
    last_print = datetime.now()

    join_col = 'CdAcidente'

    count = 0
    for record_set in collate_multiple_files(files.values(), join_col):
        if datetime.now() - last_print > timedelta(minutes=1):
            logger.info("Imported {} records".format(count))
            last_print = datetime.now()

        try:
            record = record_set[files['record']][0]
        except (KeyError, IndexError):
            # Somehow there was a record in one of the addendum files that wasn't in the main file
            # We don't have enough info to go on, so log the error and skip it
            if files['vehicles'] in record_set:
                missing_id = record_set[files['vehicles']][0][join_col]
            else:
                missing_id = record_set[files['people']][0][join_col]
            logger.warn("Found record join for ID {} but no associated incident, skipping".format(
                            missing_id))
            continue

        vehicles = record_set.get(files['vehicles'], [])
        people = record_set.get(files['people'], [])

        record_data = transform(record, vehicles, people, schema_id)
        load(record_data, args.api_url, headers)

        count += 1
    logger.info('Loading complete')


if __name__ == '__main__':
    main()
