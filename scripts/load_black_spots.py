"""Loads mock black spot data"""
import argparse
from datetime import datetime
import logging
import json
import requests
import sys


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()


def get_record_type(api_url, headers, label):
    """Gets the record type"""
    response = requests.get('{}/recordtypes/?active=True&limit=all'.format(api_url),
                            headers=headers)
    response.raise_for_status()
    results = response.json()['results']
    rectype_id = [rt['uuid'] for rt in results if rt['label'] == label][0]
    logger.info('record type id: {}'.format(rectype_id))
    return rectype_id


def read_black_spots(input_path):
    """Reads the input json file of black spots"""
    with open(input_path) as json_file:
        try:
            black_spots_json = json.load(json_file)
        except Exception:
            logger.exception('Error parsing black spots JSON file:')
            sys.exit()

        black_spots = black_spots_json['results']
        logger.info('number of black spots to load: {}'.format(len(black_spots)))

        # If there are no black spots to load from the file, exit the application
        if not len(black_spots):
            logger.info('no black spots to load, exiting')
            sys.exit()

        return black_spots


def deactivate_black_spot_sets(api_url, headers, rectype_id, now):
    """Deactivates the effective black spots if there are any"""
    url = '{}/blackspotsets/?record_type={}effective_at={}'.format(api_url, rectype_id, now)
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    results = response.json()['results']
    if len(results):
        for bss in results:
            logger.info('deactivating black spot set: {}'.format(bss['uuid']))
            bss['effective_end'] = now
            response = requests.patch('{}/blackspotsets/{}/'.format(api_url, bss['uuid']),
                                      data=bss,
                                      headers=headers)
            response.raise_for_status()


def create_black_spot_set(api_url, headers, rectype_id, now):
    """Adds a new black spot set to hold the new black spots"""
    new_bss = {
        'effective_start': now,
        'record_type': rectype_id
    }
    response = requests.post('{}/blackspotsets/'.format(api_url),
                             data=json.dumps(new_bss),
                             headers=headers)
    response.raise_for_status()
    new_bss_id = response.json()['uuid']
    logger.info('created new black spot set: {}'.format(new_bss_id))
    return new_bss_id


def create_black_spots(api_url, headers, black_spots, new_bss_id):
    """Adds the black spots"""
    for black_spot in black_spots:
        black_spot['black_spot_set'] = new_bss_id
        response = requests.post('{}/blackspots/'.format(api_url),
                                 data=json.dumps(black_spot),
                                 headers=headers)
        response.raise_for_status()
        new_bs_id = response.json()['uuid']
        logger.info('created new black spot: {}'.format(new_bs_id))


def main():
    """Main entry point for the script"""
    parser = argparse.ArgumentParser(description='Load mock black spot data')
    parser.add_argument('json_input_path', help='Path to json file containing blacks spots')
    parser.add_argument('--api-url', help='API host / path to target for loading data',
                        default='http://localhost:7000/api')
    parser.add_argument('--record-type-label', help='Label of the desired record type',
                        default='Incident')
    parser.add_argument('--authz', help='Authorization header')
    args = parser.parse_args()

    headers = {}
    headers_for_post = {'content-type': 'application/json'}
    now = datetime.now().isoformat() + 'Z'

    if args.authz:
        headers['Authorization'] = args.authz
        headers_for_post['Authorization'] = args.authz

    rectype_id = get_record_type(args.api_url, headers, args.record_type_label)
    black_spots = read_black_spots(args.json_input_path)
    deactivate_black_spot_sets(args.api_url, headers, rectype_id, now)
    new_bss_id = create_black_spot_set(args.api_url, headers_for_post, rectype_id, now)
    create_black_spots(args.api_url, headers_for_post, black_spots, new_bss_id)

    logger.info('Loading black spots complete')


if __name__ == '__main__':
    main()
