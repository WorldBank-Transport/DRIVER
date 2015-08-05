#! /usr/bin/env bash

set -e

if env | grep -q "DRIVER_DEBUG"; then
  set -x
fi

# TODO: Remove when symlinking between Angular applications
# is removed.
SCHEMA_EDITOR_ROOT=/opt/schema_editor

# If first argument is `editor` or `web` use variables
# contained within the appropriate section.
case "$1" in
  -h|help)
    echo "Usage: grunt.sh {editor,web} [GRUNT_COMMAND]"

    exit 0
    ;;

  editor)
    CONTAINER_NAME="driver-editor"
    PUBLISHED_PORT=9000
    LIVERELOAD_PORT=35731
    VOLUME_ROOT="/opt/schema_editor"
    IMAGE_NAME="driver/editor:latest"
    ;;

  web)
    CONTAINER_NAME="driver-web"
    PUBLISHED_PORT=9001
    LIVERELOAD_PORT=35732
    VOLUME_ROOT="/opt/web"
    IMAGE_NAME="driver/web:latest"
    ;;

  *)
    echo "Container type not found."
    exit 1
    ;;
esac

# If no second argument is supplied, default to `test`
if [ -z "$2" ]; then
  CMD="test"
else
  CMD="$2"
fi

# Run command within container and pass any additional
# arguments at the end of the command.
vagrant ssh app -c "sudo docker run \
  --rm \
  --name ${CONTAINER_NAME} \
  --publish ${PUBLISHED_PORT}:${PUBLISHED_PORT} \
  --publish ${LIVERELOAD_PORT}:${LIVERELOAD_PORT} \
  --volume ${VOLUME_ROOT}/dist:${VOLUME_ROOT}/dist \
  --volume ${SCHEMA_EDITOR_ROOT}/app:${SCHEMA_EDITOR_ROOT}/app \
  --volume ${SCHEMA_EDITOR_ROOT}/test:${SCHEMA_EDITOR_ROOT}/test \
  --volume ${VOLUME_ROOT}/app:${VOLUME_ROOT}/app \
  --volume ${VOLUME_ROOT}/test:${VOLUME_ROOT}/test \
  --volume ${VOLUME_ROOT}/.bowerrc:${VOLUME_ROOT}/.bowerrc \
  --volume ${VOLUME_ROOT}/.editorconfig:${VOLUME_ROOT}/.editorconfig \
  --volume ${VOLUME_ROOT}/.jshintrc:${VOLUME_ROOT}/.jshintrc \
  --volume ${VOLUME_ROOT}/bower.json:${VOLUME_ROOT}/bower.json \
  --volume ${VOLUME_ROOT}/Gruntfile.js:${VOLUME_ROOT}/Gruntfile.js \
  --volume ${VOLUME_ROOT}/package.json:${VOLUME_ROOT}/package.json \
  ${IMAGE_NAME} ${CMD} ${*:3}"
