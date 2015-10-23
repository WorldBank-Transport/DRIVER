from datetime import datetime, timedelta
import json

import mock
import pytz

from rest_framework.test import APITestCase, APIRequestFactory
from ashlar.models import RecordSchema, RecordType, Record

from data.views import DriverRecordViewSet


class DriverRecordViewTestCase(APITestCase):
    def setUp(self):
        super(DriverRecordViewTestCase, self).setUp()
        self.now = datetime.now(pytz.utc)
        self.then = self.now - timedelta(days=10)
        self.beforeThen = self.then - timedelta(days=1)
        self.afterThen = self.then + timedelta(days=1)
        self.beforeNow = self.now - timedelta(days=1)
        self.afterNow = self.now + timedelta(days=1)

        self.tod = self.now.hour
        self.dow = self.now.isoweekday() + 1  # 1 added here to handle differences in indexing

        self.record_type = RecordType.objects.create(label='foo', plural_label='foos')
        self.schema = RecordSchema.objects.create(schema={"type": "object"},
                                                  version=1,
                                                  record_type=self.record_type)
        self.record1 = Record.objects.create(occurred_from=self.now,
                                             occurred_to=self.now,
                                             geom='POINT (0 0)',
                                             location_text='Equator',
                                             schema=self.schema)
        # Create different numbers of objects at the different times so we can distinguish
        self.record2 = Record.objects.create(occurred_from=self.then,
                                             occurred_to=self.then,
                                             geom='POINT (0 0)',
                                             location_text='Equator',
                                             schema=self.schema)
        self.record3 = Record.objects.create(occurred_from=self.then,
                                             occurred_to=self.then,
                                             geom='POINT (0 0)',
                                             location_text='Equator',
                                             schema=self.schema)

    def test_toddow(self):
        url = '/api/records/toddow/?record_type={}'.format(str(self.record_type.uuid))
        response = json.loads(self.client.get(url).content)
        self.assertEqual(len(response), 2)
        for toddow in response:
            if toddow['dow'] == self.dow:
                self.assertEqual(toddow['tod'], self.tod)
                self.assertEqual(toddow['count'], 1)
            else:
                self.assertEqual(toddow['count'], 2)

    def test_arbitrary_filters(self):
        base = '/api/records/toddow/?record_type={rt}&occurred_max={dtmax}Z&occurred_min={dtmin}Z'

        url1 = base.format(rt=self.record_type.uuid,
                           dtmin=self.beforeNow.isoformat(),  # later than `then`
                           dtmax=self.afterNow.isoformat())
        response_data1 = json.loads(self.client.get(url1).content)
        self.assertEqual(len(response_data1), 1)

        url2 = base.format(rt=self.record_type.uuid,
                           dtmin=self.beforeThen.isoformat(),  # `then`
                           dtmax=self.afterNow.isoformat())
        response_data2 = json.loads(self.client.get(url2).content)
        self.assertEqual(len(response_data2), 2)
