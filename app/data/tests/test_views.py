from datetime import datetime, timedelta
import json
import uuid

import celery
import mock
import pytz

from rest_framework.request import Request

from rest_framework.test import APIClient, APITestCase, APIRequestFactory, force_authenticate
from rest_framework import status
from django.contrib.auth.models import User, Group
from django.conf import settings

from grout.models import RecordSchema, RecordType

from data.filters import RecordAuditLogFilter
from data.models import RecordAuditLogEntry, DedupeJob, RecordDuplicate, DriverRecord
from data.views import DriverRecordViewSet, DriverRecordSchemaViewSet, DriverRecordAuditLogViewSet
from data.serializers import DetailsReadOnlyRecordSerializer, DetailsReadOnlyRecordSchemaSerializer


class ViewTestSetUpMixin(object):
    def set_up_admin_client(self):
        try:
            self.admin = User.objects.get(username=settings.DEFAULT_ADMIN_USERNAME)
        except User.DoesNotExist:
            self.admin = User.objects.create_user('admin', 'admin@grout', 'admin')
            self.admin.is_superuser = True
            self.admin.is_staff = True
            self.admin.save()

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)

    def set_up_public_client(self):
        try:
            self.public = User.objects.get(username='public')
        except User.DoesNotExist:
            self.public = User.objects.create_user('public', 'public@grout', 'public')
            self.public.save()

        if not self.public.groups.exists():
            self.public.groups.add(Group.objects.get(name='public'))

        self.public_client = APIClient()
        self.public_client.force_authenticate(user=self.public)

    def set_up_records(self):
        self.now = datetime.now(pytz.timezone('Asia/Manila'))
        self.then = self.now - timedelta(days=10)
        self.beforeThen = self.then - timedelta(days=1)
        self.afterThen = self.then + timedelta(days=1)
        self.beforeNow = self.now - timedelta(days=1)
        self.afterNow = self.now + timedelta(days=1)

        self.tod = self.now.hour

        # 1 added here to handle differences in indexing
        self.dow = self.now.isoweekday() + 1 if self.now.isoweekday() + 1 <= 7 else 1

        schema = {
            "type": "object",
            "definitions": {
                "objectDetails": {
                    "properties": {
                        u"Numb\xe9r": {
                            "fieldType": "number",
                            "maximum": 10,
                            "minimum": 0,
                            "type": "integer"
                        },
                        "Itness": {
                            "displayType": "select",
                            "enum": ["It", "Not it"]
                        },
                        "ItnessMultiple": {
                            "displayType": "select",
                            "format": "checkbox",
                            "items": {
                                "enum": ["It multi", "Not it multi"]
                            }
                        }
                    }
                },
                "multiDetails": {
                    "multiple": True,
                    "properties": {
                        "MultiProperty": {
                            "displayType": "select",
                            "enum": ["Multi1", "Multi2"]
                        }
                    }
                }
            },
        }

        self.record_type = RecordType.objects.create(label='foo', plural_label='foos')
        self.schema = RecordSchema.objects.create(schema=schema,
                                                  version=1,
                                                  record_type=self.record_type)
        self.record1 = DriverRecord.objects.create(occurred_from=self.now,
                                                   occurred_to=self.now,
                                                   geom='POINT (0 0)',
                                                   location_text='Equator',
                                                   schema=self.schema,
                                                   weather='fog',
                                                   data=dict())
        # Create different numbers of objects at the different times so we can distinguish
        self.record2 = DriverRecord.objects.create(occurred_from=self.then,
                                                   occurred_to=self.then,
                                                   geom='POINT (0 0)',
                                                   location_text='Equator',
                                                   schema=self.schema,
                                                   weather='clear-day',
                                                   data=dict())
        self.record3 = DriverRecord.objects.create(occurred_from=self.then,
                                                   occurred_to=self.then,
                                                   geom='POINT (0 0)',
                                                   location_text='Equator',
                                                   schema=self.schema,
                                                   weather='cloudy',
                                                   data=dict())

    def set_up_audit_log(self):
        self.audit_log_entry1 = RecordAuditLogEntry.objects.create(
            user=self.admin,
            username=self.admin.username,
            action=RecordAuditLogEntry.ActionTypes.CREATE,
            record=self.record2,
            record_uuid=self.record2.uuid,
        )
        # CREATE audit log entry where user has been deleted
        self.audit_log_entry2 = RecordAuditLogEntry.objects.create(
            user=None,
            username='banana',
            action=RecordAuditLogEntry.ActionTypes.CREATE,
            record=self.record3,
            record_uuid=self.record3.uuid,
        )


class DriverRecordViewTestCase(APITestCase, ViewTestSetUpMixin):
    def setUp(self):
        super(DriverRecordViewTestCase, self).setUp()

        self.set_up_admin_client()
        self.set_up_public_client()
        self.set_up_records()
        self.set_up_audit_log()
        self.factory = APIRequestFactory()

    def tearDown(self):
        super(DriverRecordViewTestCase, self).tearDown()
        DriverRecord.objects.all().delete()
        RecordAuditLogEntry.objects.all().delete()

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

        response = json.loads(self.admin_client.get(url).content)
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

    def test_weather_filters(self):
        # Multiple filter values are OR'd together
        url = '/api/records/?detail_only=True&weather=fog&weather=cloudy'
        response = json.loads(self.admin_client.get(url).content)
        self.assertEqual(response['count'], 2)

    def test_created_by_admin_client_email(self):
        url = '/api/records/{uuid}/?details_only=True'.format(uuid=self.record2.uuid)
        response_data = json.loads(self.admin_client.get(url).content)
        self.assertEqual(response_data['created_by'], self.audit_log_entry1.user.email)

    def test_created_by_admin_client_username(self):
        url = '/api/records/{uuid}/?details_only=True'.format(uuid=self.record3.uuid)
        response_data = json.loads(self.admin_client.get(url).content)
        self.assertEqual(response_data['created_by'], self.audit_log_entry2.username)

    def test_created_by_public_client(self):
        url = '/api/records/?details_only=True'
        public_response_data = json.loads(self.public_client.get(url).content)
        self.assertTrue(all('created_by' not in result for result in public_response_data['results']))

    def test_unicode_in_filters_number_field(self):
        data = {
            'objectDetails': {
                u"Numb\xe9r": 1,
            },
        }
        date = datetime(2016, 1, 29, 13, 0, 0, 0, pytz.timezone('Asia/Manila'))
        test_record = DriverRecord.objects.create(
            occurred_from=date,
            occurred_to=date,
            geom='POINT (120.97 14.62)',
            location_text='Manila',
            schema=self.schema,
            data=data)

        url = '/api/records/?details_only=True&tilekey=True&jsonb={jsonb}'.format(
            jsonb=json.dumps({
                "objectDetails": {
                    u"Numb\xe9r": {
                        "_rule_type":"intrange",
                        "min": 0,
                        "max": 2
                    }
                }
            }))
        with mock.patch('data.views.get_redis_connection') as mocked_get_redis_connection:
            mocked_redis_connection = mock.Mock()
            mocked_get_redis_connection.return_value = mocked_redis_connection
            response = json.loads(self.admin_client.get(url).content)
            self.assertEqual(mocked_redis_connection.set.call_count, 1)
            self.assertEqual(type(mocked_redis_connection.set.call_args[0][1]), str)
        self.assertTrue('tilekey' in response)

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

    def test_get_serializer_class(self):
        """Test that get_serializer_class returns read-only serializer correctly"""
        view = DriverRecordViewSet()
        mock_req = mock.Mock(spec=Request)
        mock_req.user = self.public
        view.request = mock_req
        serializer_class = view.get_serializer_class()
        self.assertEqual(serializer_class, DetailsReadOnlyRecordSerializer)

    def test_audit_log_creation(self):
        """Test that audit logs are generated on create operations"""
        initial_num_records = DriverRecord.objects.count()
        initial_num_audit_log_entries = RecordAuditLogEntry.objects.count()

        url = '/api/records/'
        post_data = {
            'data': {
                'objectDetails': {
                    'Itness': 'It',
                    'ItnessMultiple': 'It multi'
                },
                'multiDetails': [
                    {
                        'MultiProperty': 'Multi1'
                    },
                    {
                        'MultiProperty': 'Multi2'
                    },
                    {
                        'MultiProperty': 'Multi2'
                    }
                ]
            },
            'schema': self.schema.pk,
            'geom': 'POINT(120.81298917531966 15.180301034030107)',
            'location_text': 'JASA, Gapan, Nueva Ecija, Central Luzon, 3105, Philippines',
            'city': 'Gapan',
            'road': 'JASA',
            'state': 'Nueva Ecija',
            'weather': '',
            'light': '',
            'occurred_from': '2015-12-31T16:00:00.000Z',
            'occurred_to': '2015-12-31T16:00:00.000Z'
        }
        response = self.admin_client.post(url, post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DriverRecord.objects.all().count(), initial_num_records + 1)
        self.assertEqual(RecordAuditLogEntry.objects.count(), initial_num_audit_log_entries + 1)


class DriverCustomReportViewTestCase(APITestCase, ViewTestSetUpMixin):
    def setUp(self):
        super(DriverCustomReportViewTestCase, self).setUp()

        self.set_up_admin_client()
        self.set_up_records()

        self.url = ('/api/records/crosstabs/?archived=False&occurred_max={max}&occurred_min={min}' +
                    '&record_type={record_type}')

        self.date1 = datetime(2015, 12, 12, 2, 0, 0, 0, pytz.timezone('Asia/Manila'))
        self.date2 = datetime(2016, 2, 29, 13, 0, 0, 0, pytz.timezone('Asia/Manila'))
        data = {
            'objectDetails': {
                'Itness': 'It',
                'ItnessMultiple': 'It multi'
            },
            'multiDetails': [
                {
                    'MultiProperty': 'Multi1'
                },
                {
                    'MultiProperty': 'Multi2'
                },
                {
                    'MultiProperty': 'Multi2'
                }
            ]
        }

        DriverRecord.objects.create(occurred_from=self.date1, occurred_to=self.date1,
                                    geom='POINT (120.97 14.62)', location_text='Manila',
                                    schema=self.schema, data=dict())
        DriverRecord.objects.create(occurred_from=self.date2, occurred_to=self.date2,
                                    geom='POINT (120.97 14.62)', location_text='Manila',
                                    schema=self.schema, data=dict())
        DriverRecord.objects.create(occurred_from=self.date2, occurred_to=self.date2,
                                    geom='POINT (120.97 14.62)', location_text='Manila',
                                    schema=self.schema, data=data)

    def test_month_by_day_of_week(self):
        """Test two gregorian date aggregations. Checks that the label arrays are
        the right length and that there's no entry for """
        url_template = (self.url + '&row_period_type=month&col_period_type=day_of_week&calendar=gregorian')
        url = url_template.format(record_type=str(self.record_type.uuid),
                                  min=(self.date1 - timedelta(days=1)).isoformat() + 'Z',
                                  max=(self.date2 + timedelta(days=1)).isoformat() + 'Z')
        response = json.loads(self.admin_client.get(url).content)

        self.assertEqual(len(response['row_labels']), 4)
        self.assertEqual(len(response['col_labels']), 7)
        self.assertEqual(response['tables'][0]['data']['(2016, 2)']['2'], 2,
                         'Should be two incidents on Tuesday in February 2016')
        self.assertTrue('(2016, 1)' not in response['tables'][0]['data'])
        self.assertTrue('(2015, 12)' in response['tables'][0]['data'])
        self.assertEqual(len(response['tables'][0]['row_totals']), 2)

    def test_year_by_property(self):
        url_template = (self.url + '&row_period_type=year' +
                        '&col_choices_path=objectDetails,properties,Itness&calendar=gregorian')
        url = url_template.format(record_type=str(self.record_type.uuid),
                                  min=(self.date1 - timedelta(days=1)).isoformat() + 'Z',
                                  max=(self.date2 + timedelta(days=1)).isoformat() + 'Z')
        response = json.loads(self.admin_client.get(url).content)
        self.assertEqual(response['tables'][0]['data']['2016']['It'], 1)

    def test_year_by_property_with_items(self):
        url_template = (self.url + '&row_period_type=year' +
                        '&col_choices_path=objectDetails,properties,ItnessMultiple,items&calendar=gregorian')
        url = url_template.format(record_type=str(self.record_type.uuid),
                                  min=(self.date1 - timedelta(days=1)).isoformat() + 'Z',
                                  max=(self.date2 + timedelta(days=1)).isoformat() + 'Z')
        response = json.loads(self.admin_client.get(url).content)
        self.assertEqual(response['tables'][0]['data']['2016']['It multi'], 1)

    def test_year_by_property_multi(self):
        """Test that 'multiple' related types within a record each get counted in aggregation"""
        url_template = (self.url + '&row_period_type=year' +
                        '&col_choices_path=multiDetails,properties,MultiProperty&calendar=gregorian')
        url = url_template.format(record_type=str(self.record_type.uuid),
                                  min=(self.date1 - timedelta(days=1)).isoformat() + 'Z',
                                  max=(self.date2 + timedelta(days=1)).isoformat() + 'Z')
        response = json.loads(self.admin_client.get(url).content)
        response_data = response['tables'][0]['data']

        # The test data includes one record that contains both a 'Multi1' and a 'Multi2'
        self.assertTrue('Multi1' in response_data['2016'], 'No key for Multi1')
        self.assertEqual(response_data['2016']['Multi1'], 1)
        self.assertTrue('Multi2' in response_data['2016'], 'No key for Multi2')
        self.assertEqual(response_data['2016']['Multi2'], 1)

        # Add another Multi1 and verify counts
        DriverRecord.objects.create(
            occurred_from=self.date2, occurred_to=self.date2,
            geom='POINT (120.97 14.62)', location_text='Manila',
            schema=self.schema, data={
                'multiDetails': [
                    {
                        'MultiProperty': 'Multi1'
                    }
                ]
            })

        response = json.loads(self.admin_client.get(url).content)
        response_data = response['tables'][0]['data']
        self.assertTrue('Multi1' in response_data['2016'], 'No key for Multi1')
        self.assertEqual(response_data['2016']['Multi1'], 2)
        self.assertTrue('Multi2' in response_data['2016'], 'No key for Multi2')
        self.assertEqual(response_data['2016']['Multi2'], 1)

        # Add another Multi1/Multi2 and verify counts
        DriverRecord.objects.create(
            occurred_from=self.date2, occurred_to=self.date2,
            geom='POINT (120.97 14.62)', location_text='Manila',
            schema=self.schema, data={
                'multiDetails': [
                    {
                        'MultiProperty': 'Multi1'
                    },
                    {
                        'MultiProperty': 'Multi2'
                    }
                ]
            })

        response = json.loads(self.admin_client.get(url).content)
        response_data = response['tables'][0]['data']
        self.assertTrue('Multi1' in response_data['2016'], 'No key for Multi1')
        self.assertEqual(response_data['2016']['Multi1'], 3)
        self.assertTrue('Multi2' in response_data['2016'], 'No key for Multi2')
        self.assertEqual(response_data['2016']['Multi2'], 2)


class DriverRecordSchemaViewTestCase(APITestCase):

    def test_get_serializer_class(self):
        """Test that get_serializer_class returns read-only serializer correctly"""
        read_only = User.objects.create_user('public', 'public@public.com', 'public')
        view = DriverRecordSchemaViewSet()
        mock_req = mock.Mock(spec=Request)
        mock_req.user = read_only
        view.request = mock_req
        serializer_class = view.get_serializer_class()
        self.assertEqual(serializer_class, DetailsReadOnlyRecordSchemaSerializer)


class DriverRecordAuditLogViewSetTestCase(APITestCase, ViewTestSetUpMixin):
    def setUp(self):
        super(DriverRecordAuditLogViewSetTestCase, self).setUp()
        self.set_up_admin_client()

        self.now = datetime.now(pytz.timezone('Asia/Manila'))
        self.ten_days_ago = self.now - timedelta(days=10)
        self.ten_days_hence = self.now + timedelta(days=10)

        self.url = '/api/audit-log/'

    def test_view_permissions(self):
        """Test that view is read-only to admin"""
        response = self.admin_client.get(self.url, {'min_date': self.ten_days_ago,
                                                    'max_date': self.ten_days_hence})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.admin_client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_param_validation(self):
        """Tests that the view ensures min_date and max_date exist and are <= 1 month apart"""
        response = self.admin_client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.admin_client.get(self.url, {'min_date': self.now})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.admin_client.get(self.url, {'max_date': self.now})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        long_long_ago = self.now - timedelta(days=300)
        response = self.admin_client.get(self.url, {'min_date': long_long_ago,
                                                    'max_date': self.ten_days_hence})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.admin_client.get(self.url, {'min_date': self.ten_days_ago,
                                                    'max_date': self.ten_days_hence})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_view_filters(self):
        """Test that view filtering works"""
        self.assertIs(DriverRecordAuditLogViewSet.filter_class, RecordAuditLogFilter)
        # Create some spurious audit log entries so that we can filter them
        for act in ['create', 'update', 'delete']:
            RecordAuditLogEntry.objects.create(user=self.admin,
                                               username='admin',
                                               record_uuid='1234',
                                               action=act)

        response = self.admin_client.get(self.url, {'min_date': self.ten_days_ago,
                                                    'max_date': self.ten_days_hence})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(3, len(json.loads(response.content)))
        response = self.admin_client.get(self.url, {'action': 'delete',
                                                    'min_date': self.ten_days_ago,
                                                    'max_date': self.ten_days_hence})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(1, len(json.loads(response.content)))
        response = self.admin_client.get(self.url, {'max_date': self.ten_days_ago,
                                                    'min_date': self.ten_days_ago})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(0, len(json.loads(response.content)))
        response = self.admin_client.get(self.url, {'username': 'admin',
                                                    'min_date': self.ten_days_ago,
                                                    'max_date': self.ten_days_hence})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(3, len(json.loads(response.content)))
        response = self.admin_client.get(self.url, {'username': 'not-a-user',
                                                    'min_date': self.ten_days_ago,
                                                    'max_date': self.ten_days_hence})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(0, len(json.loads(response.content)))


class DriverDuplicatesViewSetTestCase(APITestCase, ViewTestSetUpMixin):
    def setUp(self):
        super(DriverDuplicatesViewSetTestCase, self).setUp()
        self.set_up_admin_client()
        self.set_up_public_client()
        self.set_up_records()
        self.url = '/api/duplicates/'

        self.job = DedupeJob.objects.create()
        self.dup1 = RecordDuplicate.objects.create(job=self.job, record=self.record1,
                                                   duplicate_record=self.record2)
        self.dup2 = RecordDuplicate.objects.create(job=self.job, record=self.record1,
                                                   duplicate_record=self.record3)
        self.dup3 = RecordDuplicate.objects.create(job=self.job, record=self.record2,
                                                   duplicate_record=self.record3)

    def test_list_view(self):
        response = self.admin_client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        content = json.loads(response.content)
        self.assertEqual(4, len(content),
                         'Duplicates list response should have 4 keys (count, results, next, previous)')
        self.assertEqual(content['count'], len(content['results']))

    def test_update_permissions(self):
        """Test that view is read-only except to admin"""
        url = self.url + '{}/resolve/'.format(self.dup1.uuid)
        response = self.admin_client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.public_client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_keep_both(self):
        url = self.url + '{}/resolve/'.format(self.dup1.uuid)
        response = self.admin_client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(RecordDuplicate.objects.get(pk=self.dup1.pk).resolved)

    def test_resolve_with_A(self):
        """ Resolving with record A should resolve the duplicate and archive record B. """
        url = self.url + '{}/resolve/'.format(self.dup1.uuid)
        response = self.admin_client.patch(url, {'recordUUID': self.dup1.record.uuid})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(DriverRecord.objects.get(pk=self.dup1.record.pk).archived)
        self.assertTrue(DriverRecord.objects.get(pk=self.dup1.duplicate_record.pk).archived)
        self.assertTrue(RecordDuplicate.objects.get(pk=self.dup1.pk).resolved)
        self.assertFalse(RecordDuplicate.objects.get(pk=self.dup2.pk).resolved)
        self.assertTrue(RecordDuplicate.objects.get(pk=self.dup3.pk).resolved)

    def test_resolve_with_B(self):
        """ Resolving with record B should resolve the duplicate and archive record A,
        and also resolve any other duplicates involving record A. """
        url = self.url + '{}/resolve/'.format(self.dup2.uuid)
        response = self.admin_client.patch(url, {'recordUUID': self.dup2.duplicate_record.uuid})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(DriverRecord.objects.get(pk=self.dup2.record.pk).archived)
        self.assertFalse(DriverRecord.objects.get(pk=self.dup2.duplicate_record.pk).archived)
        self.assertTrue(RecordDuplicate.objects.get(pk=self.dup1.pk).resolved)
        self.assertTrue(RecordDuplicate.objects.get(pk=self.dup2.pk).resolved)
        self.assertFalse(RecordDuplicate.objects.get(pk=self.dup3.pk).resolved)


class RecordCsvExportViewSetTestCase(APITestCase):
    def setUp(self):
        try:
            self.admin = User.objects.get(username=settings.DEFAULT_ADMIN_USERNAME)
        except User.DoesNotExist:
            self.admin = User.objects.create_user('admin', 'admin@grout', 'admin')
            self.admin.is_superuser = True
            self.admin.is_staff = True
            self.admin.save()
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)
        self.base_url = '/api/csv-export/'

    def test_create_csv_export(self):
        """Test that POSTing kicks off a celery task"""
        test_job_id = 'test-job-id'
        with mock.patch('data.views.export_csv.delay') as mock_delay:
            mock_delay.return_value.id = test_job_id
            response = self.admin_client.post(self.base_url, {'tilekey': 'test-filter-key'})
            self.assertEqual({'success': True, 'taskid': test_job_id}, response.data)

    def test_no_filterkey(self):
        """Test that POSTing with no filterkey fails"""
        with mock.patch('data.views.export_csv.delay'):
            response = self.admin_client.post(self.base_url)
            self.assertEqual({'errors': {'tilekey': 'This parameter is required'}}, response.data)

    def test_return_job_status(self):
        """Test that GETs return job status"""

        with mock.patch('data.views.export_csv.AsyncResult',
                        spec=celery.result.AsyncResult) as mock_status:
            mock_status.return_value.state = celery.states.PENDING
            mock_status.return_value.info = dict()
            response = self.admin_client.get(self.base_url + 'fake-id/')
            self.assertEqual({'status': celery.states.PENDING, 'info': {}}, response.data)

            mock_status.return_value.state = celery.states.STARTED
            response = self.admin_client.get(self.base_url + 'fake-id/')
            self.assertEqual({'status': celery.states.STARTED, 'info': {}}, response.data)

            mock_status.return_value.state = celery.states.SUCCESS
            mock_status.return_value.get.return_value = 'filepath-here.tar.gz'
            response = self.admin_client.get(self.base_url + 'fake-id/')
            self.assertEqual({'status': celery.states.SUCCESS,
                             'result': 'http://testserver/download/filepath-here.tar.gz'},
                             response.data)

            mock_status.return_value.state = celery.states.FAILURE
            mock_status.return_value.get.return_value = 'error msg here'
            response = self.admin_client.get(self.base_url + 'fake-id/')
            self.assertEqual({'status': celery.states.FAILURE, 'error': 'error msg here'},
                             response.data)
