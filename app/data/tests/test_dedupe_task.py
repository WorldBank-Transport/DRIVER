from datetime import datetime, timedelta
import pytz

from grout.models import RecordSchema, RecordType
from data.models import DedupeJob, RecordDuplicate, DriverRecord
from data.tasks import find_duplicates as task

from django.test import TestCase
from django.test.utils import override_settings

from django.db.models import Q


class DedupeTaskTestCase(TestCase):
    @override_settings(
        CELERY_EAGER_PROPAGATES_EXCEPTIONS=True,
        CELERY_ALWAYS_EAGER=True,
        BROKER_BACKEND='memory'
    )
    def setUp(self):
        super(DedupeTaskTestCase, self).setUp()
        self.start = datetime.now(pytz.timezone('Asia/Manila'))
        self.then = self.start - timedelta(days=10)
        self.beforeThen = self.then - timedelta(days=1)
        self.afterThen = self.then + timedelta(days=1)
        self.beforeNow = self.start - timedelta(days=1)
        self.afterNow = self.start + timedelta(days=1)

        self.tod = self.start.hour
        self.dow = self.start.isoweekday() + 1  # 1 added here to handle differences in indexing

        self.record_type = RecordType.objects.create(label='foo', plural_label='foos')
        self.schema = RecordSchema.objects.create(
            schema={"type": "object"},
            version=1,
            record_type=self.record_type
        )
        # 3 identical records to test dedupe
        self.record1 = DriverRecord.objects.create(
            occurred_from=self.start,
            occurred_to=self.start,
            geom='POINT (0 0)',
            location_text='Equator1',
            schema=self.schema,
            data=dict()
        )
        self.record2 = DriverRecord.objects.create(
            occurred_from=self.start,
            occurred_to=self.start,
            geom='POINT (0 0)',
            location_text='Equator2',
            schema=self.schema,
            data=dict()
        )
        self.record3 = DriverRecord.objects.create(
            occurred_from=self.start,
            occurred_to=self.start,
            geom='POINT (0 0.0001)',
            location_text='Equator3',
            schema=self.schema,
            data=dict()
        )
        # and one that shouldn't be considered a duplicate
        self.record4 = DriverRecord.objects.create(
            occurred_from=self.start,
            occurred_to=self.start,
            geom='POINT (0 5)',
            location_text='somewhere else1',
            schema=self.schema,
            data=dict()
        )
        self.stop = datetime.now(pytz.timezone('Asia/Manila'))

    @override_settings(
        CELERY_EAGER_PROPAGATES_EXCEPTIONS=True,
        CELERY_ALWAYS_EAGER=True,
        BROKER_BACKEND='memory'
    )
    def test_find_duplicate_records(self):
        self.assertEqual(DedupeJob.objects.count(), 0)
        self.assertEqual(RecordDuplicate.objects.count(), 0)

        # find all duplicates
        result = task.find_duplicate_records.delay().get()

        self.assertEqual(DedupeJob.objects.count(), 1)
        self.assertEqual(RecordDuplicate.objects.count(), 3)
        self.assertEqual(
            RecordDuplicate.objects.filter(
                Q(record=self.record4) | Q(duplicate_record=self.record4)
            ).count(),
            0
        )
        self.assertIsNotNone(DedupeJob.objects.latest().celery_task)

        # test incremental dedupe task
        now = datetime.now().replace(tzinfo=pytz.timezone('Asia/Manila'))
        newrecord = DriverRecord.objects.create(
            occurred_from=now,
            occurred_to=now,
            geom='POINT (0 5)',
            location_text='somewhere else2',
            schema=self.schema,
            data=dict()
        )
        result = task.find_duplicate_records.delay().get()
        self.assertEqual(DedupeJob.objects.count(), 2)
        self.assertEqual(
            RecordDuplicate.objects.filter(
                Q(record=newrecord) | Q(duplicate_record=newrecord)
            ).count(),
            1
        )
        self.assertEqual(RecordDuplicate.objects.count(), 4)

    @override_settings(
        CELERY_EAGER_PROPAGATES_EXCEPTIONS=True,
        CELERY_ALWAYS_EAGER=True,
        BROKER_BACKEND='memory'
    )
    def test_get_dedupe_ids(self):
        self.assertEqual(DedupeJob.objects.count(), 0)
        self.assertEqual(RecordDuplicate.objects.count(), 0)

        result = task.find_duplicate_records.delay().get()
        job1 = DedupeJob.objects.latest()

        now = datetime.now().replace(tzinfo=pytz.timezone('Asia/Manila'))
        newrecord = DriverRecord.objects.create(
            occurred_from=now,
            occurred_to=now,
            geom='POINT (0 5)',
            location_text='somewhere else2',
            schema=self.schema,
            data=dict()
        )
        result = task.find_duplicate_records.delay().get()

        job2 = DedupeJob.objects.latest()

        self.assertNotEqual(job1, job2)
        self.assertEqual(
            len(task.get_dedupe_ids(job1)),
            RecordDuplicate.objects.filter(job=job1).count()
        )

    @override_settings(
        CELERY_EAGER_PROPAGATES_EXCEPTIONS=True,
        CELERY_ALWAYS_EAGER=True,
        BROKER_BACKEND='memory'
    )
    def test_get_dedupe_set(self):
        self.assertEqual(DedupeJob.objects.count(), 0)
        self.assertEqual(RecordDuplicate.objects.count(), 0)
        start2 = datetime.utcnow().replace(tzinfo=pytz.timezone('UTC'))
        newrecord = DriverRecord.objects.create(
            occurred_from=self.start,
            occurred_to=self.start,
            geom='POINT (0 5)',
            location_text='somewhere else2',
            schema=self.schema,
            data=dict()
        )
        stop2 = datetime.utcnow().replace(tzinfo=pytz.timezone('UTC'))
        set, queryset = task.get_dedupe_set({'start_time': self.start, 'end_time': self.stop})
        self.assertEqual(len(set), 4)
        set, queryset = task.get_dedupe_set({'start_time': start2, 'end_time': stop2})
        self.assertEqual(len(set), 1)

    def test_get_time_extent(self):
        time = DriverRecord.objects.earliest('created').created
        job = DedupeJob(status=DedupeJob.Status.SUCCESS)
        job.save()
        result = task.get_time_extent(job)

        self.assertEqual(result['start_time'], time)
        self.assertEqual(result['end_time'], job.datetime)

    def test_find_duplicates_for_record(self):
        tdiff = timedelta(hours=1)
        results = task.find_duplicates_for_record(self.record1.uuid, tdiff, 0.001)
        self.assertEqual(results.count(), 2)

    def test_calculate_similarity_score(self):
        time_allowance = timedelta(hours=1)
        distance_allowance = .001
        self.assertEqual(
            task.calculate_similarity_score(
                self.record1, self.record2, time_allowance, distance_allowance
            ), 1.0
        )
        self.assertTrue(
            task.calculate_similarity_score(
                self.record1, self.record4, time_allowance, distance_allowance
            ) < 0
        )
