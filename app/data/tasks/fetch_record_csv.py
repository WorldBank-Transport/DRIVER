import csv
from django.core.files import File
from collections import namedtuple
import tempfile
import re

from celery import shared_task

from data.models import DriverRecord
from grout.models import RecordType
from black_spots.models import BlackSpotRecordsFile


# Keys which cannot be usefully exported to csv
DROPPED_KEYS = ['media']
# static record fields
RECORD_FIELDS = ['record_id', 'created', 'modified', 'occurred_from',
                 'occurred_to', 'lat', 'lon', 'location_text',
                 'city', 'city_district', 'county', 'neighborhood', 'road',
                 'state', 'weather', 'light']


def FIELD_TRANSFORMS():
    def date_iso(d):
        return d.isoformat()

    FieldTransform = namedtuple('FieldTransform', ['field', 'transform'])
    return {
        'record_id': FieldTransform(field='uuid', transform=lambda uuid: str(uuid)),
        'created': FieldTransform(field='created', transform=date_iso),
        'modified': FieldTransform(field='modified', transform=date_iso),
        'occurred_from': FieldTransform(field='occurred_from', transform=date_iso),
        'occurred_to': FieldTransform(field='occurred_to', transform=date_iso),
        'lat': FieldTransform(field='geom', transform=lambda geom: geom.y),
        'lon': FieldTransform(field='geom', transform=lambda geom: geom.x),
    }


def to_utf8(s):
    """Convert to utf8 encoding and strip special whitespace/commas for csv writing"""
    if isinstance(s, str):
        return re.sub(r'[\r\n\t]', '', s)
    elif isinstance(s, unicode):
        return re.sub(r'[\r\n\t]', '', s).encode('utf-8')
    elif s is None:
        return unicode('').encode('utf-8')
    else:
        return re.sub(r'[\r\n\t]', '', unicode(s)).encode('utf-8')


def generate_row_dicts(records_qs, record_detail_fields, details_key):
    transforms = FIELD_TRANSFORMS()

    for record in records_qs.iterator():
        row = dict()
        for field in RECORD_FIELDS:
            if field in transforms:
                ft = transforms[field]
                row[field] = to_utf8(ft.transform(getattr(record, ft.field)))
            else:
                row[field] = to_utf8(getattr(record, field))
        for field in record_detail_fields:
            if field in transforms:
                ft = transforms[field]
                if ft.field in record.data[details_key]:
                    row[field] = to_utf8(ft.transform(record.data[details_key][ft.field]))
                else:
                    row[field] = ''
            else:
                if field in record.data[details_key]:
                    row[field] = to_utf8(record.data[details_key][field])
                else:
                    row[field] = ''
        yield row


@shared_task
def export_records(occurred_min, occurred_max, record_type_id):
    def is_hidden(field):
        try:
            return field['options']['hidden']
        except KeyError:
            return False

    record_type = RecordType.objects.get(uuid=record_type_id)
    schema = record_type.get_current_schema()

    jsonschema = schema.schema
    details_key, details_subschema = next(
        (key, subschema) for key, subschema in jsonschema['definitions'].items()
        if subschema.get('details', False)
    )
    record_detail_fields = [
        to_utf8(key) for key, val in details_subschema['properties'].items()
        if not is_hidden(val) and key not in DROPPED_KEYS
    ]

    records = DriverRecord.objects.filter(
        occurred_from__gte=occurred_min,
        occurred_to__lte=occurred_max,
        schema__record_type=record_type,
        archived=False
    )

    row_dicts = generate_row_dicts(records, record_detail_fields, details_key)

    with tempfile.SpooledTemporaryFile(max_size=128000000) as csvfile:  # 128 mb
        csv_columns = RECORD_FIELDS + record_detail_fields
        writer = csv.DictWriter(csvfile, fieldnames=csv_columns)

        writer.writeheader()
        writer.writerows(row_dicts)

        store = BlackSpotRecordsFile()
        #  seek to the beginning of file so it can be read into the store
        csvfile.seek(0, 0)
        saved_filename = '{}.csv'.format(store.uuid)
        store.csv.save(saved_filename, File(csvfile))
        return str(store.uuid)
