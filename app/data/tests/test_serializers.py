from django.test import TestCase

from django.conf import settings
from rest_framework.serializers import ModelSerializer
from grout import serializer_fields

from data import serializers
from data.models import RecordAuditLogEntry


class DetailsReadOnlyRecordSerializerTestCase(TestCase):
    def setUp(self):
        self.serializer = serializers.DetailsReadOnlyRecordSerializer()

    def test_filter_details_only(self):
        """Test that non-read-only fields are dropped"""
        with self.assertRaises(serializer_fields.DropJsonKeyException):
            self.serializer.filter_details_only('Hidden Secrets', {})
        self.assertEqual(('Visible Details', {}),
                         self.serializer.filter_details_only('Visible Details', {}))


class DetailsReadOnlyRecordSchemaSerializerTestCase(TestCase):
    def setUp(self):
        self.serializer = serializers.DetailsReadOnlyRecordSchemaSerializer()

    def test_transform_details_only(self):
        """Test that non-read-only keys are removed from 'properties' and 'definitions'"""
        test_value = {'Incident Details': {}, 'Related Info 1': {}, 'Related Info 2': {}}
        self.assertEqual(('definitions', {'Incident Details': {}}),
                         self.serializer.make_read_only_schema('definitions', test_value))
        self.assertEqual(('properties', {'Incident Details': {}}),
                         self.serializer.make_read_only_schema('properties', test_value))
        self.assertEqual(('no_transform', test_value),
                         self.serializer.make_read_only_schema('no_transform', test_value))


class RecordAuditLogEntrySerializerTestCase(TestCase):
    def setUp(self):
        self.serializer = serializers.RecordAuditLogEntrySerializer()

    def test_serializer_type(self):
        """Ensure that the serializer has the correct inheritances"""
        self.assertIsInstance(self.serializer, ModelSerializer)
        self.assertIs(self.serializer.Meta.model, RecordAuditLogEntry)
