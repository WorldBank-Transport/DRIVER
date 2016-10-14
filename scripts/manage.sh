#! /usr/bin/env bash

set -e

if env | grep -q "DRIVER_DEBUG"; then
  set -x
fi

vagrant ssh app -c "sudo docker exec \
  -ti \
  driver-app \
  ./manage.py $*"
