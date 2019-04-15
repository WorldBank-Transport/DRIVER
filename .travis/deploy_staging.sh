#!/usr/bin/env bash

set -e
set -x

for image in app editor web gradle analysis;
do
  docker push "quay.io/azavea/driver-${image}:${TRAVIS_COMMIT:0:7}"
  docker tag "quay.io/azavea/driver-${image}:${TRAVIS_COMMIT:0:7}" "quay.io/azavea/driver-${image}:latest"
  docker push "quay.io/azavea/driver-${image}:latest"
done

# Set up group vars
echo "setting up group vars..."
set +x
echo "web_js_nominatim_key: \"${NOMINATIM_API_KEY}\"" \
    >> deployment/ansible/group_vars/staging
echo "oauth_client_id: \"${OAUTH_CLIENT_ID}\"" \
    >> deployment/ansible/group_vars/staging
echo "oauth_client_secret: \"${OAUTH_CLIENT_SECRET}\"" \
    >> deployment/ansible/group_vars/staging
echo "forecast_io_api_key: \"${FORECAST_IO_API_KEY}\"" \
    >> deployment/ansible/group_vars/staging
echo "keystore_password: \"${DRIVER_KEYSTORE_PASSWORD}\"" \
    >> deployment/ansible/group_vars/staging
set -x

ansible-galaxy install -f -r deployment/ansible/roles.yml -p deployment/ansible/roles

chmod 0600 deployment/driver.pem

ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook \
  -i deployment/ansible/inventory/staging \
  --private-key="${TRAVIS_BUILD_DIR}/deployment/driver.pem" \
  deployment/ansible/database.yml deployment/ansible/app.yml deployment/ansible/celery.yml
