import csv
import os
import zipfile
import tempfile
import time
import StringIO
import pytz

from django.conf import settings
from django.contrib.auth.models import User

from celery import shared_task
from celery.utils.log import get_task_logger

from django_redis import get_redis_connection

from data.models import DriverRecord

from driver_auth.permissions import is_admin_or_writer

logger = get_task_logger(__name__)
local_tz = pytz.timezone(settings.TIME_ZONE)


def _utf8(value):
    """
    Helper for properly encoding values that may contain unicode characters.
    From https://github.com/azavea/django-queryset-csv/blob/master/djqscsv/djqscsv.py#L174

    :param value: The string to encode
    """
    if isinstance(value, str):
        return value
    elif isinstance(value, unicode):
        return value.encode('utf-8')
    else:
        return unicode(value).encode('utf-8')


def _sanitize(value):
    """
    Helper for sanitizing the record type label to ensure it doesn't contain characters that are
    invalid in filenames such as slashes.
    This keeps spaces, periods, underscores, and all unicode characters.

    :param value: The string to sanitize
    """
    return ''.join(char for char in value if char.isalnum() or char in [' ', '.', '_']).rstrip()


@shared_task(track_started=True)
def export_csv(query_key, user_id):
    """Exports a set of records to a series of CSV files and places them in a compressed tarball
    :param query_key: A UUID corresponding to a cached SQL query which will be used to filter
                      which records are returned. This is the same key used to generate filtered
                      Windshaft tiles so that the CSV will correspond to the filters applied in
                      the UI.
    """
    # Get Records
    records = get_queryset_by_key(query_key)
    # Get the most recent Schema for the Records' RecordType
    # This assumes that all of the Records have the same RecordType.
    try:
        record_type = records[0].schema.record_type
        schema = record_type.get_current_schema()
    except IndexError:
        raise Exception('Filter includes no records')

    # Get user
    user = User.objects.get(pk=user_id)
    # Create files and CSV Writers from Schema
    if is_admin_or_writer(user):
        record_writer = DriverRecordExporter(schema)
    else:
        record_writer = ReadOnlyRecordExporter(schema)

    # Write records to files
    for rec in records:
        record_writer.write_record(rec)
    record_writer.finish()

    # Compress files into a single zipfile.
    # TODO: Figure out how to transfer files to web users from celery workers

    # external_attr is 4 bytes ins size. The high order two bytes represend UNIX permission and
    # file type bits, while the low order two contain MS-DOS FAT file attributes, most notably
    # bit 4 marking directories
    # For information on setting file permissions in zipfile, see
    # http://stackoverflow.com/questions/434641/how-do-i-set-permissions-attributes-on-a-file-in-a-zip-file-using-pythons-zip

    filename = "{}-{}.zip".format(_utf8(_sanitize(record_type.plural_label)), query_key[:8])
    path = os.path.join(settings.CELERY_EXPORTS_FILE_PATH, filename)

    archive = zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED)
    # Add a directory for the schema we're outputting
    dirname = 'schema-' + str(schema.pk) + '/'
    for f, name in record_writer.get_files_and_names():
        t = time.struct_time(time.localtime(time.time()))
        info = zipfile.ZipInfo(filename=dirname + name, date_time=(
            t.tm_year, t.tm_mon, t.tm_mday, t.tm_hour, t.tm_min, t.tm_sec
        ))
        info.external_attr = 0755 << 16L
        with open(f.name, 'r') as z:
            archive.writestr(info, z.read())
    archive.close()

    # Cleanup
    record_writer.cleanup()

    return os.path.basename(archive.filename)


def get_sql_string_by_key(key):
    """Returns a SQL string from Redis using key
    :param key: A UUID pointing to the SQL string
    """
    # Since the records list endpoint bypasses the Django caching framework, do that here too
    redis_conn = get_redis_connection('default')
    return redis_conn.get(key)


def get_queryset_by_key(key):
    """Returns a queryset by filtering Records using the SQL stored in Redis at key
    :param key: A UUID specifying the SQL string to use
    """
    sql_str = get_sql_string_by_key(key)
    return DriverRecord.objects.raw(sql_str)


class DriverRecordExporter(object):
    """Exports Records matching a schema to CSVs"""
    def __init__(self, schema_obj):
        # Detect related info types and set up CSV Writers as necessary
        self.schema = schema_obj.schema

        # Make output writers and output files
        self.rec_writer = self.make_record_and_details_writer()
        # All non-details related info types
        self.writers = {related: self.make_related_info_writer(related, subschema)
                        for related, subschema in self.schema['definitions'].viewitems()
                        if not subschema.get('details')}

        self.rec_outfile, self.outfiles = self.setup_output_files()
        self.write_headers()

    def setup_output_files(self):
        """Create the output files necessary for writing CSVs"""
        # Using NamedTemporaryFiles is necessary for creating tarballs containing temp files
        # https://bugs.python.org/issue21044
        rec_outfile = tempfile.NamedTemporaryFile(delete=False)
        outfiles = {related: tempfile.NamedTemporaryFile(delete=False)
                    for related, subschema in self.schema['definitions'].iteritems()
                    if not subschema.get('details')}
        return (rec_outfile, outfiles)

    def write_headers(self):
        """Write CSV headers to output files"""
        # Write CSV header to all files
        self.rec_writer.write_header(self.rec_outfile)
        for related_name, writer in self.writers.viewitems():
            writer.write_header(self.outfiles[related_name])

    def finish(self):
        """Close all open file handles"""
        self.rec_outfile.close()
        for f in self.outfiles.values():
            f.close()

    def cleanup(self):
        """Deletes all temporary files"""
        os.remove(self.rec_outfile.name)
        for f in self.outfiles.values():
            os.remove(f.name)

    def get_files_and_names(self):
        """Return all file objects maintained by this exporter along with suggested names"""
        yield (self.rec_outfile, 'records.csv')
        for related_name, out_file in self.outfiles.viewitems():
            yield (out_file, related_name + '.csv')

    def write_record(self, rec):
        """Pass rec's fields through all writers to output all info as CSVs"""
        # First the constants writer
        self.rec_writer.write_record(rec, self.rec_outfile)
        # Next, use the related info writers to output to the appropriate files
        for related_name, writer in self.writers.viewitems():
            if related_name in rec.data:
                if writer.is_multiple:
                    for item in rec.data[related_name]:
                        writer.write_related(rec.pk, item, self.outfiles[related_name])
                else:
                    writer.write_related(rec.pk, rec.data[related_name],
                                         self.outfiles[related_name])

    def make_constants_csv_writer(self):
        """Generate a Record Writer capable of writing out the non-json fields of a Record"""
        def render_date(d):
            return d.astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')

        # TODO: Currently this is hard-coded; it may be worthwhile to make this introspect Record
        # to figure out which fields to use, but that will be somewhat involved.
        csv_columns = ['record_id', 'timezone', 'created', 'modified', 'occurred_from',
                       'occurred_to', 'lat', 'lon', 'location_text',
                       'city', 'city_district', 'county', 'neighborhood', 'road',
                       'state', 'weather', 'light']
        # Model field from which to get data for each csv column
        source_fields = {
            'record_id': 'uuid',
            'timezone': None,
            'lat': 'geom',
            'lon': 'geom'
        }

        # Some model fields need to be transformed before they can go into a CSV
        value_transforms = {
            'record_id': lambda uuid: str(uuid),
            'timezone': lambda _: settings.TIME_ZONE,
            'created': render_date,
            'modified': render_date,
            'occurred_from': render_date,
            'occurred_to': render_date,
            'lat': lambda geom: geom.y,
            'lon': lambda geom: geom.x,
        }
        return RecordModelWriter(csv_columns, source_fields, value_transforms)

    def make_related_info_writer(self, info_name, info_definition, include_record_id=True):
        """Generate a RelatedInfoExporter capable of writing out a particular related info field
        :param info_definition: The definitions entry providing the sub-schema to write out.
        """
        # Need to drop Media fields; we can't export them to CSV usefully.
        drop_keys = dict()
        for prop, attributes in info_definition['properties'].iteritems():
            if 'media' in attributes:
                drop_keys[prop] = None
        return RelatedInfoWriter(info_name, info_definition, field_transform=drop_keys,
                                 include_record_id=include_record_id)

    def make_record_and_details_writer(self):
        """Generate a writer to put record fields and details in one CSV"""
        model_writer = self.make_constants_csv_writer()
        details = {key: subschema for key, subschema in self.schema['definitions'].viewitems()
                   if subschema.get('details') is True}
        details_key = details.keys()[0]
        details_writer = self.make_related_info_writer(details_key, details[details_key],
                                                       include_record_id=False)
        return ModelAndDetailsWriter(model_writer, details_writer, details_key)


class ReadOnlyRecordExporter(DriverRecordExporter):
    """Export only fields which read-only users are allow to access"""
    def __init__(self, schema_obj):
        # Don't write any related info fields, just details only.
        self.schema = schema_obj.schema

        # Make output writers and output files
        self.rec_writer = self.make_record_and_details_writer()
        self.writers = dict()

        self.rec_outfile, self.outfiles = self.setup_output_files()
        self.write_headers()

    def setup_output_files(self):
        """Create the output files necessary for writing CSVs"""
        # Using NamedTemporaryFiles is necessary for creating tarballs containing temp files
        # https://bugs.python.org/issue21044
        rec_outfile = tempfile.NamedTemporaryFile(delete=False)
        outfiles = dict()
        return (rec_outfile, outfiles)


class BaseRecordWriter(object):
    """Base class for some common functions that exporters need"""

    def write_header(self, csv_file):
        """Write the CSV header to csv_file"""
        # Need to sanitize CSV columns to utf-8 before writing
        header_columns = [_utf8(col) for col in self.csv_columns]
        writer = csv.DictWriter(csv_file, fieldnames=header_columns)
        writer.writeheader()


class ModelAndDetailsWriter(BaseRecordWriter):
    """Exports records' model fields, and the *Details field, to a single CSV"""
    def __init__(self, model_writer, details_writer, details_key):
        """Creates a combined writer
        :param model_writer: A RecordModelWriter instance that will be used to write model fields
        :param details_writer: A RelatedInfoWriter instance that will be used to write Details
        """
        self.model_writer = model_writer
        self.details_writer = details_writer
        self.details_key = details_key

    def merge_lines(self, lines_str):
        """Merge lines written by separate CSV writers to a single line by replacing '\r\n' with ','
        """
        return lines_str.replace('\r\n', ',').rstrip(',') + '\r\n'

    def write_header(self, csv_file):
        """Write writer headers to a CSV file"""
        output = StringIO.StringIO()
        self.model_writer.write_header(output)
        self.details_writer.write_header(output)
        csv_file.write(self.merge_lines(output.getvalue()))

    def write_record(self, record, csv_file):
        """Pull data from a record, send to appropriate writers, and then combine output"""
        output = StringIO.StringIO()
        self.model_writer.write_record(record, output)
        self.details_writer.write_related(record.pk, record.data[self.details_key], output)
        csv_file.write(self.merge_lines(output.getvalue()))


class RecordModelWriter(BaseRecordWriter):
    """Exports records' model fields to CSV"""
    def __init__(self, csv_columns, source_fields=dict(), value_transforms=dict()):
        """Creates a record exporter
        :param csv_columns: List of columns names to write out to the CSV.
                            E.g. ['latitude', 'longitude']
        :param source_fields: Dictionary mapping column names to the name of the model field where
                              the appropriate value can be found.
                              E.g. {'latitude': 'geom', 'longitude': 'geom'}
                              Pulls from attributes with the same name as the column name by default
        :param value_transforms: Dictionary mapping column names to functions by which to transform
                                 model field values before writing to the CSV.
                                 E.g. {'latitude': lambda geom: geom.y}
                                 If a field is not included here, it will be used directly
        """
        self.csv_columns = csv_columns
        self.source_fields = source_fields
        self.value_transforms = value_transforms

    def write_record(self, record, csv_file):
        """Pull field data from record object, transform, write to csv_file"""
        output_data = dict()
        for column in self.csv_columns:
            model_value = self.get_model_value_for_column(record, column)
            csv_val = self.transform_model_value(model_value, column)
            output_data[column] = _utf8(csv_val)
        writer = csv.DictWriter(csv_file, fieldnames=self.csv_columns)
        writer.writerow(output_data)

    def get_model_value_for_column(self, record, column):
        """Gets the value from the appropriate model field to populate column"""
        # Get the value from record.<source_field> if a <source_field> is defined for <column>,
        # otherwise get it from record.<column>
        model_field = self.source_fields.get(column, column)
        if model_field is None:
            return None
        return getattr(record, model_field)

    def transform_model_value(self, value, column):
        """Transforms value into an appropriate value for column"""
        # Pass the value through any necessary transformation before output.
        val_transform = self.value_transforms.get(column, lambda v: v)
        return val_transform(value)


class RelatedInfoWriter(BaseRecordWriter):
    """Exports related info properties to CSV"""
    def __init__(self, info_name, info_definition, field_transform=dict(), include_record_id=True):
        # Construct a field name mapping; this allows dropping Media fields from CSVs and
        # allows renaming _localid to something more useful. The final output will be a mapping
        # of all fields in the related info definition to the corresponding field that should
        # be output in the CSV. If a field name is mapped to None then it is dropped.
        self.property_transform = field_transform
        try:
            for prop in info_definition['properties']:
                if prop not in self.property_transform:
                    self.property_transform[prop] = prop
        except KeyError:
            raise ValueError("Related info definition has no 'properties'; can't detect fields")
        self.property_transform['_localId'] = info_name + '_id'
        info_columns = [col for col in self.property_transform.values() if col is not None]
        self.output_record_id = include_record_id
        if self.output_record_id:
            # Need to label every row with the id of the record it relates to
            self.csv_columns = ['record_id'] + info_columns
        else:
            self.csv_columns = info_columns
        self.is_multiple = info_definition.get('multiple', False)

    def write_related(self, record_id, related_info, csv_file):
        """Transform related_info and write to csv_file"""
        # Transform
        output_data = self.transform_value_keys(related_info)

        # Append record_id
        if self.output_record_id:
            output_data['record_id'] = record_id

        # Write
        writer = csv.DictWriter(csv_file, fieldnames=self.csv_columns)
        writer.writerow(output_data)

    def transform_value_keys(self, related_info):
        """Set incoming values to new keys in output_data based on self.property_transform"""
        output_data = dict()
        for in_key, out_key in self.property_transform.viewitems():
            if out_key is not None:
                try:
                    # Assign the value of the input data to the renamed key in the output data
                    output_data[out_key] = _utf8(related_info.pop(in_key))
                except KeyError:
                    # in_key doesn't exist in input; this is fine, the CSV writer will handle it
                    pass
        return output_data
