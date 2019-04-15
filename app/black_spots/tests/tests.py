import json

from dateutil.parser import parse
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.utils import timezone

from rest_framework.test import APIClient, APITestCase, APIRequestFactory

from grout.models import RecordType

from black_spots.models import (BlackSpot, BlackSpotSet)


class BlackSpotSetViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('test', 'test@test.com', 'test')
        self.user.is_superuser = True
        self.user.is_staff = True
        self.user.save()

        self.record_type = RecordType.objects.create(label='foo', plural_label='foos')

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.factory = APIRequestFactory()
        self.list_url = reverse('blackspotsets-list')

    def test_list(self):
        """Test to make sure test_list returns the right number of results"""
        BlackSpotSet.objects.create(
            effective_start=timezone.now(),
            record_type=self.record_type
        )
        response_data = json.loads(self.client.get(self.list_url).content)
        self.assertEqual(response_data['count'], 1)

    def test_detail(self):
        """Test that basic fields returned properly"""
        black_spot_set = BlackSpotSet.objects.create(
            effective_start=timezone.now(),
            record_type=self.record_type
        )
        response_data = json.loads(self.client.get(self.list_url).content)
        result = response_data['results'][0]

        self.assertEqual(unicode(black_spot_set.pk), result['uuid'])
        self.assertEqual(str(black_spot_set.record_type.uuid), result['record_type'])
        self.assertEqual(black_spot_set.effective_start, parse(result['effective_start']))
        self.assertEqual(None, result['effective_end'])

    def test_filter_by_record_type(self):
        """Test that filtering by record_type works"""
        BlackSpotSet.objects.create(
            effective_start=timezone.now(),
            record_type=self.record_type
        )
        url = '{}?record_type={}'.format(self.list_url, self.record_type.pk)
        response_data = json.loads(self.client.get(url).content)
        result = response_data['results'][0]

        self.assertEqual(unicode(self.record_type.pk), result['record_type'])

        # Nothing should be returned if an invalid record_type is supplied
        url = '{}?record_type=does-not-exist'.format(self.list_url)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 0)

    def test_filter_by_effective_at(self):
        """Test that filtering by effective_at works"""

        date_1 = '2000-01-01T00:00:00Z'
        date_2 = '2005-01-01T00:00:00Z'
        date_3 = '2006-01-01T00:00:00Z'
        date_4 = '2008-01-01T00:00:00Z'
        date_5 = '2009-01-01T00:00:00Z'

        first = BlackSpotSet.objects.create(
            effective_start=parse(date_2),
            effective_end=parse(date_3),
            record_type=self.record_type
        )
        second = BlackSpotSet.objects.create(
            effective_start=parse(date_3),
            effective_end=parse(date_4),
            record_type=self.record_type
        )
        third = BlackSpotSet.objects.create(
            effective_start=date_4,
            record_type=self.record_type
        )

        url_format = '{}?effective_at={}'

        # There should be no black spot sets on the first date
        url = url_format.format(self.list_url, date_1)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 0)

        # There should be no black spot sets on the first date
        url = url_format.format(self.list_url, date_1)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 0)

        # The first set should be valid on the second date
        url = url_format.format(self.list_url, date_2)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 1)
        result = response_data['results'][0]
        self.assertEqual(unicode(first.pk), result['uuid'])

        # The second set should be valid on the third date
        url = url_format.format(self.list_url, date_3)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 1)
        result = response_data['results'][0]
        self.assertEqual(unicode(second.pk), result['uuid'])

        # The third set should be valid on the fourth and fifth dates
        url = url_format.format(self.list_url, date_4)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 1)
        result = response_data['results'][0]
        self.assertEqual(unicode(third.pk), result['uuid'])
        url = url_format.format(self.list_url, date_5)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 1)
        result = response_data['results'][0]
        self.assertEqual(unicode(third.pk), result['uuid'])


class BlackSpotViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('test', 'test@test.com', 'test')
        self.user.is_superuser = True
        self.user.is_staff = True
        self.user.save()

        self.record_type = RecordType.objects.create(label='foo', plural_label='foos')
        self.black_spot_set = BlackSpotSet.objects.create(
            effective_start=timezone.now(),
            record_type=self.record_type
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.factory = APIRequestFactory()
        self.list_url = reverse('blackspots-list')

    def test_list(self):
        """Test to make sure test_list returns the right number of results"""
        BlackSpot.objects.create(
            geom='POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
            severity_score=0.5,
            num_records=9,
            num_severe=2,
            black_spot_set=self.black_spot_set
        )
        response_data = json.loads(self.client.get(self.list_url).content)
        self.assertEqual(response_data['count'], 1)

    def test_detail(self):
        """Test that basic fields returned properly"""
        black_spot = BlackSpot.objects.create(
            geom='POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
            severity_score=0.5,
            num_records=9,
            num_severe=2,
            black_spot_set=self.black_spot_set
        )
        response_data = json.loads(self.client.get(self.list_url).content)
        result = response_data['results'][0]

        self.assertEqual(unicode(black_spot.pk), result['uuid'])
        self.assertEqual(str(black_spot.black_spot_set.uuid), result['black_spot_set'])
        self.assertEqual(black_spot.severity_score, result['severity_score'])
        self.assertEqual(black_spot.num_records, result['num_records'])
        self.assertEqual(black_spot.num_severe, result['num_severe'])
        self.assertEqual('Polygon', result['geom']['type'])

    def test_filter_by_black_spot_set(self):
        """Test that filtering by black_spot_set works"""
        BlackSpot.objects.create(
            geom='POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
            severity_score=0.5,
            num_records=9,
            num_severe=2,
            black_spot_set=self.black_spot_set
        )
        url = '{}?black_spot_set={}'.format(self.list_url, self.black_spot_set.pk)
        response_data = json.loads(self.client.get(url).content)
        result = response_data['results'][0]

        self.assertEqual(unicode(self.black_spot_set.pk), result['black_spot_set'])

        # Nothing should be returned if an invalid black_spot_set is supplied
        url = '{}?black_spot_set=does-not-exist'.format(self.list_url)
        response_data = json.loads(self.client.get(url).content)
        self.assertEqual(response_data['count'], 0)
