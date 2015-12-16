from django.test import TestCase

from django.conf import settings
from ashlar import serializer_fields

from data import serializers


class DetailsReadOnlyRecordSerializerTestCase(TestCase):
    def setUp(self):
        self.serializer = serializers.DetailsReadOnlyRecordSerializer()

    def test_filter_details_only(self):
        """Test that non-read-only fields are dropped"""
        with self.assertRaises(serializer_fields.DropJsonKeyException):
            self.serializer.filter_details_only('Definitely Not Details', {})
        for field_name in settings.READ_ONLY_FIELDS:
            self.assertEqual((field_name, {}), self.serializer.filter_details_only(field_name, {}))


class DetailsReadOnlyRecordSchemaSerializerTestCase(TestCase):
    def setUp(self):
        self.serializer = serializers.DetailsReadOnlyRecordSchemaSerializer()

    def test_transform_details_only(self):
        """Test that non-read-only keys are removed from 'properties' and 'definitions'"""
        test_value = {'Accident Details': {}, 'Related Info 1': {}, 'Related Info 2': {}}
        self.assertEqual(('definitions', {'Accident Details': {}}),
                         self.serializer.make_read_only_schema('definitions', test_value))
        self.assertEqual(('properties', {'Accident Details': {}}),
                         self.serializer.make_read_only_schema('properties', test_value))
        self.assertEqual(('no_transform', test_value),
                         self.serializer.make_read_only_schema('no_transform', test_value))
