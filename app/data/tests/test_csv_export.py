from datetime import datetime
import mock
import os
import pytz
import StringIO
import unittest

from django.test import TestCase

from django_redis import get_redis_connection

from grout.models import RecordSchema, RecordType

from data.tasks.export_csv import (get_sql_string_by_key, get_queryset_by_key,
                                   DriverRecordExporter, ReadOnlyRecordExporter,
                                   RecordModelWriter, RelatedInfoWriter,
                                   ModelAndDetailsWriter)


class DriverRecordExporterTestCase(TestCase):
    def setUp(self):
        record_type = RecordType.objects.create(label='foo', plural_label='foos')
        self.schema_def = {
            'type': 'object',
            'definitions': {
                'testRelatedOne': {
                    'multiple': True,
                    'properties': {},
                    'details': False
                },
                'testRelatedTwo': {
                    'multiple': False,
                    'properties': {},
                    'details': True
                }
            }
        }
        self.schema = RecordSchema.objects.create(schema=self.schema_def, version=1,
                                                  record_type=record_type)
        self.exporter = DriverRecordExporter(self.schema)
        self.read_only_exporter = ReadOnlyRecordExporter(self.schema)

    def tearDown(self):
        self.exporter.finish()
        self.exporter.cleanup()

    def test_constant_info_setup(self):
        """Test that a writer and output file are created for constant fields"""
        self.assertIsInstance(self.exporter.rec_writer, ModelAndDetailsWriter)
        self.assertIsNotNone(self.exporter.rec_outfile, file)

    def test_related_info_detection(self):
        """Test that related fields are detected and writers/outfiles created"""
        # The Details field is excluded from the related info writers, so we expect to have
        # one fewer writer and output files than there are related info types.
        self.assertEqual(len(self.exporter.writers), len(self.schema.schema['definitions']) - 1)
        self.assertEqual(len(self.exporter.outfiles), len(self.schema.schema['definitions']) - 1)
        expectedKeys = [key for key, subschema in self.schema_def['definitions'].viewitems()
                        if subschema['details'] is False]
        for key in expectedKeys:
            self.assertIn(key, self.exporter.writers, '{} missing from output writers'.format(key))
            self.assertIn(key, self.exporter.outfiles, '{} missing from output files'.format(key))
        for writer in self.exporter.writers.values():
            self.assertIsInstance(writer, RelatedInfoWriter)
        # Checking for file-like objects in Python is not easy.
        for outfile in self.exporter.outfiles.values():
            self.assertIsNotNone(outfile, file)

    def test_read_only_exporter(self):
        """Test that a ReadOnlyRecordExporter has the expected writers and outfiles"""
        self.assertEqual(len(self.read_only_exporter.writers), 0)
        self.assertEqual(len(self.read_only_exporter.outfiles), 0)
        self.assertIsNotNone(self.read_only_exporter.rec_outfile)


class RecordModelWriterTestCase(TestCase):
    def setUp(self):
        self.csv_columns = ['test1', 'test2']
        self.outfile = StringIO.StringIO()

    def tearDown(self):
        self.outfile.close()

    def test_write_header(self):
        """Test that the header written to a file"""
        writer = RecordModelWriter(self.csv_columns, {}, {})
        writer.write_header(self.outfile)
        self.assertEqual(self.outfile.getvalue(), 'test1,test2\r\n')

    def test_get_model_value_for_column(self):
        """Test that values are pulled from the correct model fields"""
        writer = RecordModelWriter(self.csv_columns, {'test1': 'other1'}, {})
        record = mock.MagicMock(test1=1, other1=2)
        self.assertEqual(writer.get_model_value_for_column(record, 'other1'), 2)

    def test_transform_model_value(self):
        """Test that values are transformed by the correct filter before writing"""
        transforms = {
            'test1': lambda x: x * 2,
            'test2': lambda x: x * 4
        }
        writer = RecordModelWriter(self.csv_columns, {}, transforms)
        self.assertEqual(writer.transform_model_value(2, 'test1'), 2 * 2)
        self.assertEqual(writer.transform_model_value(2, 'test2'), 2 * 4)

    def test_write_record(self):
        """Test that writer outputs to a file"""
        writer = RecordModelWriter(self.csv_columns, {}, {})
        record = mock.MagicMock(test1=1, test2=2, no_out=3)
        writer.write_record(record, self.outfile)
        self.assertEqual(self.outfile.getvalue(), '1,2\r\n')


class RelatedInfoWriterTestCase(TestCase):
    def setUp(self):
        self.definition = {
            'multiple': True,
            'properties': {
                'prop1': {
                },
                'prop2': {
                },
            }
        }
        self.definition_name = 'testRelatedInfo'
        self.outfile = StringIO.StringIO()

    def tearDown(self):
        self.outfile.close()

    def test_property_auto_detect(self):
        """Test that the Exporter auto-detects sub-schema fields properly"""
        bad_def = {}
        with self.assertRaises(ValueError):
            writer = RelatedInfoWriter(self.definition_name, bad_def)
        writer = RelatedInfoWriter(self.definition_name, self.definition, field_transform=dict())
        self.assertEqual(writer.is_multiple, self.definition['multiple'])
        self.assertEqual(4, len(writer.csv_columns))
        for prop in ['record_id', 'testRelatedInfo_id', 'prop1', 'prop2']:
            self.assertIn(prop, writer.csv_columns, '{} missing from CSV columns'.format(prop))

    def test_transform_value_keys(self):
        """Test that key names are changed and values dropped if specified"""
        rename_transform = {'prop1': 'newName'}
        drop_transform = {'prop1': None}
        rename_writer = RelatedInfoWriter(self.definition_name, self.definition,
                                            field_transform=rename_transform)
        drop_writer = RelatedInfoWriter(self.definition_name, self.definition,
                                          field_transform=drop_transform)
        input_data = {'prop1': 'value'}
        self.assertEqual(rename_writer.transform_value_keys(input_data), {'newName': 'value'})
        self.assertEqual(drop_writer.transform_value_keys(input_data), dict())

    def test_write_header(self):
        """Test that the header written to a file"""
        writer = RelatedInfoWriter(self.definition_name, self.definition, field_transform=dict())
        writer.write_header(self.outfile)
        header = self.outfile.getvalue()
        # Unlike the Record exporter, the related info exporter doesn't have a defined field order
        for col in ['prop1', 'prop2', 'record_id', 'testRelatedInfo_id']:
            self.assertIn(col, header, '{} not found in header line'.format(col))

    def test_write_related(self):
        """Test that related info is written to a file"""
        writer = RelatedInfoWriter(self.definition_name, self.definition, field_transform=dict())
        related_info = {'prop1': 'value1', 'prop2': 'value2', '_localId': 'relInfoId'}
        writer.write_related('record-id', related_info, self.outfile)
        csv_line = self.outfile.getvalue()
        for val in ['value1', 'value2', 'relInfoId', 'record-id']:
            self.assertIn(val, csv_line, '{} not found in CSV line'.format(val))
