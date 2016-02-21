#!/usr/bin/env python

import json
import os
import sys

import redis
import subprocess


DRIVER_REDIS_HOST = os.getenv('DRIVER_REDIS_HOST', '192.168.12.101')
DRIVER_REDIS_PORT = os.getenv('DRIVER_REDIS_PORT', 6379)
DRIVER_REDIS_JAR_DB = os.getenv('DRIVER_REDIS_JAR_DB', 3)
TIMEOUT_SECONDS = 60


print('\nSetting up redis subscription for gradle task')
sys.stdout.flush()
r = redis.StrictRedis(host=DRIVER_REDIS_HOST,
                      port=DRIVER_REDIS_PORT,
                      db=DRIVER_REDIS_JAR_DB,
                      socket_connect_timeout=10)

if not r.ping():
    print('Cannot ping redis!')
    sys.stdout.flush()
    sys.exit(1)

pub = r.pubsub()
pub.subscribe('jar-build')

print('Successfully connected to redis')

for message in pub.listen():
    if message['type'] == 'message':
        try:
            data = message['data']
            data = json.loads(data.decode('utf-8'))
            uuid = data['uuid']
            schema = json.dumps(data['schema'])
            if r.get(uuid):
                print('Jar already exists for {uuid}; skipping'.format(uuid=uuid))
                sys.stdout.flush()
                continue
            subprocess.check_call(['/bin/bash', 'run.sh', uuid, schema],
                timeout=TIMEOUT_SECONDS)
        except (ValueError, KeyError) as ex:
            print('malformed message received: {message}'.format(message=message))
            sys.stdout.flush()
        except subprocess.CalledProcessError as ex:
            print('jar build process failed with: {ex}'.format(ex=ex))
            r.delete(uuid)
        except subprocess.TimeoutExpired as ex:
            print('jar build process timed out: {ex}'.format(ex=ex))
            r.delete(uuid)

        sys.stdout.flush()

print('Redis subscription loop exited! Was there an error with the connection?')
pub.close()
