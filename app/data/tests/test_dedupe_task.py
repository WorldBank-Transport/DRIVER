from datetime import datetime, timedelta

import pytz

from ashlar.models import RecordSchema, RecordType, Record
from data.models import DedupeJob, RecordDuplicate
from data.tasks.deduplicate_records import find_duplicate_records

from django.test import TestCase
from django.db.models import Q


class DedupeTaskTestCase(TestCase):
    def setUp(self):
        super(DedupeTaskTestCase, self).setUp()
        self.now = datetime.now(pytz.timezone('Asia/Manila'))
        self.then = self.now - timedelta(days=10)
        self.beforeThen = self.then - timedelta(days=1)
        self.afterThen = self.then + timedelta(days=1)
        self.beforeNow = self.now - timedelta(days=1)
        self.afterNow = self.now + timedelta(days=1)

        self.tod = self.now.hour
        self.dow = self.now.isoweekday() + 1  # 1 added here to handle differences in indexing

        self.record_type = RecordType.objects.create(label='foo', plural_label='foos')
        self.schema = RecordSchema.objects.create(
            schema={"type": "object"},
            version=1,
            record_type=self.record_type
        )
        # 3 identical records to test dedupe
        self.record1 = Record.objects.create(
            occurred_from=self.now,
            occurred_to=self.now,
            geom='POINT (0 0)',
            location_text='Equator1',
            schema=self.schema
        )
        self.record2 = Record.objects.create(
            occurred_from=self.now,
            occurred_to=self.now,
            geom='POINT (0 0.00001)',
            location_text='Equator2',
            schema=self.schema
        )
        self.record3 = Record.objects.create(
            occurred_from=self.now,
            occurred_to=self.now,
            geom='POINT (0 0.0002)',
            location_text='Equator3',
            schema=self.schema
        )
        # and one that shouldn't be considered a duplicate
        self.record4 = Record.objects.create(
            occurred_from=self.now,
            occurred_to=self.now,
            geom='POINT (0 5)',
            location_text='somewhere else1',
            schema=self.schema
        )

    def test_find_duplicate_records(self):
        self.assertEqual(DedupeJob.objects.count(), 0)
        self.assertEqual(RecordDuplicate.objects.count(), 0)

        # find all duplicates
        find_duplicate_records()

        self.assertEqual(DedupeJob.objects.count(), 1)
        self.assertEqual(RecordDuplicate.objects.count(), 3)
        self.assertEqual(
            RecordDuplicate.objects.filter(
                Q(record=self.record4) | Q(duplicate_record=self.record4)
            ).count(),
            0
        )

        # test incremental dedupe task
        now = datetime.utcnow().replace(tzinfo=pytz.timezone('UTC'))
        newrecord = Record.objects.create(
            occurred_from=now,
            occurred_to=now,
            geom='POINT (0 5)',
            location_text='somewhere else2',
            schema=self.schema
        )
        find_duplicate_records()
        self.assertEqual(DedupeJob.objects.count(), 2)
        self.assertEqual(
            RecordDuplicate.objects.filter(
                Q(record=newrecord) | Q(duplicate_record=newrecord)
            ).count(),
            1
        )
        self.assertEqual(RecordDuplicate.objects.count(), 4)
