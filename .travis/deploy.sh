#!/usr/bin/env bash

set -e

for image in app editor web;
do
  docker push "quay.io/azavea/driver-${image}:${TRAVIS_COMMIT:0:7}"
  docker tag -f "quay.io/azavea/driver-${image}:${TRAVIS_COMMIT:0:7}" "quay.io/azavea/driver-${image}:latest"
  docker push "quay.io/azavea/driver-${image}:latest"
done
