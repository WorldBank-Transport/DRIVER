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


def logmsg(msg, *args, **kwargs):
    print(msg.format(*args, **kwargs))
    sys.stdout.flush()


logmsg('\nSetting up redis subscription for gradle task')
r = redis.StrictRedis(host=DRIVER_REDIS_HOST,
                      port=DRIVER_REDIS_PORT,
                      db=DRIVER_REDIS_JAR_DB,
                      socket_connect_timeout=10)

logmsg('Pinging Redis to test connectivity')
if not r.ping():
    logmsg('Cannot ping redis!')
    sys.exit(1)

logmsg("Starting Redis subscription...")

pub = r.pubsub()
pub.subscribe('jar-build')

logmsg("Listening for messages...")
for message in pub.listen():
    logmsg('Received item')
    if message['type'] != 'message':
        logmsg("Item was not a message, it was a {}", message['type'])
    else:
        logmsg('Received message, processing...')
        try:
            data = message['data']
            data = json.loads(data.decode('utf-8'))
            uuid = data['uuid']
            schema = json.dumps(data['schema'])
            if r.get(uuid):
                logmsg('Jar already exists for {uuid}; skipping', uuid=uuid)
                continue
            subprocess.check_call(['/bin/bash', 'run.sh', uuid, schema],
                                  timeout=TIMEOUT_SECONDS)
        except (ValueError, KeyError) as ex:
            logmsg('malformed message received: {message}', message=message)
        except subprocess.CalledProcessError as ex:
            logmsg('jar build process failed with: {ex}', ex=ex)
            r.delete(uuid)
        except subprocess.TimeoutExpired as ex:
            logmsg('jar build process timed out: {ex}', ex=ex)
            r.delete(uuid)
        else:
            logmsg('Finished processing successfully')


logmsg('Redis subscription loop exited! Was there an error with the connection?')
pub.close()
