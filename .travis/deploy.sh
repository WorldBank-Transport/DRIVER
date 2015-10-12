#!/usr/bin/env bash

set -e
set -x

for image in app editor web;
do
  docker push "quay.io/azavea/driver-${image}:${TRAVIS_COMMIT:0:7}"
  docker tag -f "quay.io/azavea/driver-${image}:${TRAVIS_COMMIT:0:7}" "quay.io/azavea/driver-${image}:latest"
  docker push "quay.io/azavea/driver-${image}:latest"
done

# Set up group vars
grep -v nominatim_key deployment/ansible/group_vars/all.example \
    > deployment/ansible/group_vars/all
echo "web_js_nominatim_key=\"${NOMINATIM_API_KEY}\"" \
    >> deployment/ansible/group_vars/all

ansible-galaxy install -f -r deployment/ansible/roles.txt -p deployment/ansible/roles

chmod 0600 deployment/driver.pem

ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook \
  -i deployment/ansible/inventory/staging \
  --private-key="${TRAVIS_BUILD_DIR}/deployment/driver.pem" \
  deployment/ansible/database.yml deployment/ansible/app.yml
