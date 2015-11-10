from datetime import datetime, timedelta
import json
import uuid

import mock
import pytz

from rest_framework.test import APIClient, APITestCase, APIRequestFactory, force_authenticate
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

from ashlar.models import RecordSchema, RecordType, Record

from data.views import DriverRecordViewSet


class DriverRecordViewTestCase(APITestCase):
    def setUp(self):
        super(DriverRecordViewTestCase, self).setUp()

        self.admin = User.objects.create_user('admin', 'admin@ashlar', 'admin')
        self.admin.is_superuser = True
        self.admin.is_staff = True
        self.admin.save()

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)
        self.factory = APIRequestFactory()

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
        response = json.loads(self.admin_client.get(url).content)
        self.assertEqual(len(response), 2)
        for toddow in response:
            if toddow['dow'] == self.dow:
                self.assertEqual(toddow['tod'], self.tod)
                self.assertEqual(toddow['count'], 1)
            else:
                self.assertEqual(toddow['count'], 2)

    def test_stepwise(self):
        """Test that date filtering is working appropriately and that data is being binned properly
        """
        url = ('/api/records/stepwise/?record_type={uuid}&occurred_max={maximum}&occurred_min={minimum}'
               .format(uuid=str(self.record_type.uuid),
                       minimum=self.beforeThen.isoformat() + 'Z',
                       maximum=datetime.now().isoformat() + 'Z'))

        response = json.loads(self.client.get(url).content)
        self.assertEqual(len(response), 2)
        for step in response:
            if step['week'] == self.now.isocalendar()[1]:
                self.assertEqual(step['count'], 1)
            else:
                self.assertEqual(step['count'], 2)

    def test_arbitrary_filters(self):
        base = '/api/records/toddow/?record_type={rt}&occurred_max={dtmax}Z&occurred_min={dtmin}Z'

        url1 = base.format(rt=self.record_type.uuid,
                           dtmin=self.beforeNow.isoformat(),  # later than `then`
                           dtmax=self.afterNow.isoformat())
        response_data1 = json.loads(self.admin_client.get(url1).content)
        self.assertEqual(len(response_data1), 1)

        url2 = base.format(rt=self.record_type.uuid,
                           dtmin=self.beforeThen.isoformat(),  # `then`
                           dtmax=self.afterNow.isoformat())
        response_data2 = json.loads(self.admin_client.get(url2).content)
        self.assertEqual(len(response_data2), 2)

    def test_tilekey_param(self):
        """Ensure that the tilekey param stores a SQL query in Redis and returns an access token"""
        # Since the call to store in redis won't have access to a real Redis instance under test,
        # just ensure that it gets called when the correct query parameter is passed in.
        with mock.patch.object(DriverRecordViewSet, '_cache_tile_sql') as mocked_redis:
            factory = APIRequestFactory()
            view = DriverRecordViewSet.as_view({'get': 'list'})
            request = factory.get('/api/records/', {'tilekey': 'true'})
            force_authenticate(request, user=self.admin)
            response = view(request)
            self.assertEqual(mocked_redis.call_count, 1)
            self.assertIn('tilekey', response.data)
            # Since we're dealing with unserialized responses, this returns a UUID object.
            self.assertEqual(type(response.data['tilekey']), type(uuid.uuid4()))
            # Shouldn't be called again if 'tilekey' parameter is missing
            request = factory.get('/api/records/')
            force_authenticate(request, user=self.admin)
            response = view(request)
            self.assertEqual(mocked_redis.call_count, 1)
