#!/bin/sh

# Build a JAR of updated Android models for a schema.
# Takes two command-line arguments:
# 1 - UUID of schema
# 2 - the schema, as a string
# 3 - expiry time for JAR file in redis, in seconds

# use temp file for output jar file and temp dir for input schemas
MODEL_JAR=`mktemp data/models.XXXXX.jar`
SCHEMA_SOURCE_DIR=`mktemp -d data/schemas.XXXXX`
ANDROID_KEYSTORE="data/driver.keystore"
KEYSTORE_ALIAS="driver"
TSA_URL="http://timestamp.digicert.com"
# name of json file gets used by jsonschema2pojo for the base class
DRIVER_SCHEMA_FILE="DriverSchema.json"

# register the cleanup function to be called on the EXIT signal
trap "echo 'Cleaning up...'; rm $MODEL_JAR; rm -rf $SCHEMA_SOURCE_DIR; echo 'All done!'" EXIT

# delete redis key for schema, if it exists
redis-cli -h $DRIVER_REDIS_HOST -p $DRIVER_REDIS_PORT -n $DRIVER_REDIS_JAR_DB DEL ${SCHEMA_UUID}

echo "Going to build new model jarfile ${MODEL_JAR}..."

echo "$2" > $SCHEMA_SOURCE_DIR/${DRIVER_SCHEMA_FILE}

gradle clean assemble dexify --project-prop outfile=$MODEL_JAR \
    --project-prop sourcedir=$SCHEMA_SOURCE_DIR

echo 'Model jarfile built.'

if [ ! -e "$ANDROID_KEYSTORE" ]; then
    echo 'No key store present for jar signing! Exiting.'
    exit -1
fi

# sign jar: http://developer.android.com/tools/publishing/app-signing.html
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "$ANDROID_KEYSTORE" \
    -storepass "$DRIVER_KEYSTORE_PASSWORD" -tsa "$TSA_URL" "$MODEL_JAR" "$KEYSTORE_ALIAS"

# verfiy JAR is signed
jarsigner -verify -certs -keystore "$ANDROID_KEYSTORE" "$MODEL_JAR"

# put jar file contents into redis
redis-cli -h $DRIVER_REDIS_HOST -p $DRIVER_REDIS_PORT -n $DRIVER_REDIS_JAR_DB -x SET $1 < $MODEL_JAR

# set expiry on key
redis-cli -h $DRIVER_REDIS_HOST -p $DRIVER_REDIS_PORT -n $DRIVER_REDIS_JAR_DB EXPIRE $3

echo "Jar contents set in redis for schema ${1}. All done!"
