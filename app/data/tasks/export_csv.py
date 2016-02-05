import csv
import os
import tarfile
import tempfile

from celery import shared_task
from celery.utils.log import get_task_logger

from django_redis import get_redis_connection

from ashlar.models import Record

logger = get_task_logger(__name__)


@shared_task
def export_csv(query_key):
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
    schema = records[0].schema.record_type.get_current_schema()
    # Create files and CSV Writers from Schema
    record_writer = AshlarRecordExporter(schema)

    # Write records to files
    for rec in records:
        record_writer.write_record(rec)

    # Compress files into a single tarball.
    # TODO: Figure out how to transfer files to web users from celery workers
    def set_permission_bits(tarinfo):
        # Will be used to set permissions on all files going into the tarball.
        tarinfo.mode = 0755
        return tarinfo

    archive = tarfile.open('/var/www/media/{}.tar.gz'.format(query_key), mode='w:gz')
    # Add a directory for the schema we're outputting
    dir = tarfile.TarInfo('schema-' + str(schema.pk))
    dir.type = tarfile.DIRTYPE
    dir.mode = 0755
    archive.addfile(dir)
    # Then add all files associated with this schema to the tarball
    record_writer.finish()  # Closes files
    for f, name in record_writer.get_files_and_names():
        archive.add(f.name, arcname=os.path.join(dir.name, name), filter=set_permission_bits)
    archive.close()

    # Cleanup
    record_writer.cleanup()

    return archive.name


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
    return Record.objects.raw(sql_str)


class AshlarRecordExporter(object):
    """Exports Records matching a schema to CSVs"""
    def __init__(self, schema_obj):
        # Detect related info types and set up CSV Writers as necessary
        self.schema = schema_obj.schema

        # Make output writers and output files
        self.rec_writer = self.make_constants_csv_writer()
        self.writers = {related: self.make_related_info_writer(related, subschema)
                        for related, subschema in self.schema['definitions'].viewitems()}
        # Using NamedTemporaryFiles is necessary for creating tarballs containing temp files
        # https://bugs.python.org/issue21044
        self.rec_outfile = tempfile.NamedTemporaryFile(delete=False)
        self.outfiles = {related: tempfile.NamedTemporaryFile(delete=False)
                         for related in self.schema['definitions']}

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
        result = [(self.rec_outfile, 'records.csv')]
        for related_name, out_file in self.outfiles.viewitems():
            result.append((out_file, related_name + '.csv'))
        return result

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
        """Generate a CSV Writer capable of writing out the non-json fields of a Record"""
        # TODO: Currently this is hard-coded; it may be worthwhile to make this introspect Record
        # to figure out which fields to use, but that will be somewhat involved.
        csv_columns = ['record_id', 'created', 'modified', 'occurred_from',
                       'occurred_to', 'lat', 'lon', 'location_text',
                       'city', 'city_district', 'county', 'neighborhood', 'road',
                       'state', 'weather', 'light']
        # Model field from which to get data for each csv column
        source_fields = {'record_id': 'uuid',
                         'lat': 'geom',
                         'lon': 'geom'}
        # Some model fields need to be transformed before they can go into a CSV
        date_iso = lambda d: d.isoformat()
        value_transforms = {
            'record_id': lambda uuid: str(uuid),
            'created': date_iso,
            'modified': date_iso,
            'occurred_from': date_iso,
            'occurred_to': date_iso,
            'lat': lambda geom: geom.y,
            'lon': lambda geom: geom.x,
        }
        return RecordModelExporter(csv_columns, source_fields, value_transforms)

    def make_related_info_writer(self, info_name, info_definition):
        """Generate a RelatedInfoExporter capable of writing out a particular related info field
        :param info_definition: The definitions entry providing the sub-schema to write out.
        """
        # Need to drop Media fields; we can't export them to CSV usefully.
        drop_keys = dict()
        for prop in info_definition['properties']:
            if 'media' in info_definition['properties'][prop]:
                drop_keys[prop] = None
        return RelatedInfoExporter(info_name, info_definition, field_transform=drop_keys)


class BaseRecordExporter(object):
    """Base class for some common functions that exporters need"""
    # From https://github.com/azavea/django-queryset-csv/blob/master/djqscsv/djqscsv.py#L174
    def _utf8(self, value):
        if isinstance(value, str):
            return value
        elif isinstance(value, unicode):
            return value.encode('utf-8')
        else:
            return unicode(value).encode('utf-8')

    def write_header(self, csv_file):
        """Write the CSV header to csv_file"""
        writer = csv.DictWriter(csv_file, fieldnames=self.csv_columns)
        writer.writeheader()


class RecordModelExporter(BaseRecordExporter):
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
            output_data[column] = self._utf8(csv_val)
        writer = csv.DictWriter(csv_file, fieldnames=self.csv_columns)
        writer.writerow(output_data)

    def get_model_value_for_column(self, record, column):
        """Gets the value from the appropriate model field to populate column"""
        # Get the value from record.<column> if no source_field specified, otherwise
        # get it from record.<source_field>
        model_field = column
        if column in self.source_fields:
            model_field = self.source_fields[column]
        return getattr(record, model_field)

    def transform_model_value(self, value, column):
        """Transforms value into an appropriate value for column"""
        # Pass the value through any necessary transformation before output.
        val_transform = lambda v: v
        if column in self.value_transforms:
            val_transform = self.value_transforms[column]
        return val_transform(value)


class RelatedInfoExporter(BaseRecordExporter):
    """Exports related info properties to CSV"""
    def __init__(self, info_name, info_definition, field_transform=dict()):
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
        # Need to label every row with the id of the record it relates to
        self.csv_columns = ['record_id'] + info_columns
        self.is_multiple = info_definition.get('multiple', False)

    def write_related(self, record_id, related_info, csv_file):
        """Transform related_info and write to csv_file"""
        # Transform
        output_data = self.transform_value_keys(related_info)

        # Append record_id
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
                    output_data[out_key] = self._utf8(related_info.pop(in_key))
                except KeyError:
                    # in_key doesn't exist in input; this is fine, the CSV writer will handle it
                    pass
        return output_data
