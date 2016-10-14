#!/usr/bin/env bash

set -e
set -x

docker run "quay.io/azavea/driver-editor:${TRAVIS_COMMIT:0:7}" travis
docker run \
  -v "${TRAVIS_BUILD_DIR}/schema_editor:/opt/schema_editor" \
  "quay.io/azavea/driver-web:${TRAVIS_COMMIT:0:7}" travis

docker run \
  -d \
  --name database \
  --privileged \
  -e POSTGRES_USER=prs \
  -e POSTGRES_PASSWORD=prs \
  -e POSTGRES_DB=prs \
  quay.io/azavea/postgis:0.1.0

sleep 15

docker run \
  --link database:database \
  -e DJANGO_SETTINGS_MODULE='driver.settings_travis' \
  -e DJANGO_SECRET_KEY='driver' \
  -e DJANGO_STATIC_ROOT='/tmp' \
  -e DJANGO_MEDIA_ROOT='/tmp' \
  --entrypoint python \
  "quay.io/azavea/driver-app:${TRAVIS_COMMIT:0:7}" \
  manage.py test --noinput
