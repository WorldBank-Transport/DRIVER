import re
import datetime
import pytz

from rest_framework.serializers import (ModelSerializer, SerializerMethodField, ValidationError)

from ashlar import serializers
from ashlar import serializer_fields

from models import RecordAuditLogEntry, RecordDuplicate, RecordCostConfig

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
        return settings.HOST_URL + '/#!/record/{}/details'.format(str(obj.record_uuid))

    class Meta:
        model = RecordAuditLogEntry
        fields = ['date', 'username', 'action', 'record_url']


class RecordDuplicateSerializer(ModelSerializer):
    record = DriverRecordSerializer(required=False, allow_null=True)
    duplicate_record = DriverRecordSerializer(required=False, allow_null=True)

    class Meta:
        model = RecordDuplicate


class RecordCostConfigSerializer(ModelSerializer):
    def validate(self, data):
        """Check that the most recent schema for the record type matches the passed enum fields"""
        # Object-level validation and partial updates do not go well together:
        # https://github.com/tomchristie/django-rest-framework/issues/3070

        # Helper for getting the value of a key and falling back to the instance value if available
        def get_from_data(key):
            if self.instance:
                return data.get(key, getattr(self.instance, key))
            return data.get(key)

        cost_keys = set(get_from_data('enum_costs').keys())
        schema = get_from_data('record_type').get_current_schema()
        # TODO: This snippet also appears in data/views.py and should be refactored into the Ashlar
        # RecordSchema model
        path = [get_from_data('content_type_key'), 'properties', get_from_data('property_key')]
        obj = schema.schema['definitions']  # 'definitions' is the root of all schema paths
        for key in path:
            try:
                obj = obj[key]
            except KeyError:
                raise ValidationError("The property '{}' does not exist on the schema".format(key))
        choices = obj.get('enum', None)
        if not choices:
            raise ValidationError("The specified property must have choices (be an enum).")

        choice_keys = set(choices)
        if len(cost_keys.symmetric_difference(choice_keys)) != 0:
            raise ValidationError('The costs specified don\'t match the choices in the schema')
        return data

    class Meta:
        model = RecordCostConfig
