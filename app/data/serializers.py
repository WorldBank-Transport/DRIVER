import re
import datetime
import pytz

from rest_framework.serializers import ModelSerializer, SerializerMethodField, ValidationError

from ashlar import serializers
from ashlar import serializer_fields

from models import RecordAuditLogEntry, RecordDuplicate

from django.conf import settings


class DriverRecordSerializer(serializers.RecordSerializer):
    def validate_occurred_from(self, value):
        """ Require that record occurred_from be in the past. """
        if value > datetime.datetime.now(pytz.timezone(settings.TIME_ZONE)):
            raise ValidationError('Occurred date must not be in the future.')
        return value


class DetailsReadOnlyRecordSerializer(DriverRecordSerializer):
    """Serialize records with only read-only fields included"""
    data = serializer_fields.MethodTransformJsonField('filter_details_only')

    def filter_details_only(self, key, value):
        """Return only the details object and no other related info"""
        if re.search(settings.READ_ONLY_FIELDS_REGEX, key):
            return key, value
        else:
            raise serializer_fields.DropJsonKeyException


class DetailsReadOnlyRecordSchemaSerializer(serializers.RecordSchemaSerializer):
    """Serialize Schema with only read-only fields included"""
    schema = serializer_fields.MethodTransformJsonField('make_read_only_schema')

    def make_read_only_schema(self, key, value):
        if key != 'properties' and key != 'definitions':
            return key, value

        # If we're looking at properties/definitions, remove everything that isn't read-only
        new_value = {}
        for k in value.viewkeys():
            if re.search(settings.READ_ONLY_FIELDS_REGEX, k):
                new_value[k] = value[k]
        return key, new_value


class RecordAuditLogEntrySerializer(ModelSerializer):
    """Serialize Audit Log Entries"""
    record_url = SerializerMethodField()

    def get_record_url(self, obj):
        return settings.HOST_URL + '/#!/record/{}/details'.format(str(obj.uuid))

    class Meta:
        model = RecordAuditLogEntry
        fields = ['date', 'username', 'action', 'record_uuid', 'record_url', 'uuid']


class RecordDuplicateSerializer(ModelSerializer):
    record = DriverRecordSerializer(required=False, allow_null=True)
    duplicate_record = DriverRecordSerializer(required=False, allow_null=True)

    class Meta:
        model = RecordDuplicate
