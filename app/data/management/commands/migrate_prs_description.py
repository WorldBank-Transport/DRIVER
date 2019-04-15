import uuid
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand

from grout.models import Record


class Command(BaseCommand):
    """One-off script for PRS to hide sensitive information in incident Description

    To accomplish this we manually create a Related Object type with a Paragraph text field, and
    use this script to migrate all existing records to have their incident's Description in that
    new field instead.

    This may result in records who do not accurately match any schema, but their data should still
    be accessible.
    """

    help = 'Migrate values in Incident Details\' Description to a Related Content type.'

    def handle(self, *args, **options):
        source_type = 'incidentDetails'
        source_field = 'Description'
        target_type = 'driverNotes'
        target_field = 'Notes'

        qs = Record.objects.filter(
            schema__record_type__label='Incident'
        ).extra(where=["data->'{}'->>'{}' != ''".format(source_type, source_field)])

        total = qs.count()
        print "{} - Updating {} records".format(datetime.now(), total)

        last_print = datetime.now()

        for index, record in enumerate(qs.iterator()):
            if datetime.now() - last_print > timedelta(minutes=1):
                percent = int(100.0 * index / total)
                print "{} - {}% - Updated {} of {}".format(datetime.now(), percent, index, total)
                last_print = datetime.now()

            record.data[target_type] = {
                '_localId': uuid.uuid4(),
                target_field: record.data[source_type][source_field]
            }
            record.data[source_type][source_field] = ''
            record.save()
        print "{} - Completed".format(datetime.now())
