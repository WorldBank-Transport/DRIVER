import json

from django.contrib.auth.models import User
from django.core.urlresolvers import reverse

from rest_framework.test import APIClient, APITestCase, APIRequestFactory
from rest_framework import status

from user_filters.models import SavedFilter


class SavedFilterViewSetTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('test', 'test@test.com', 'test')

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.factory = APIRequestFactory()
        self.list_url = reverse('userfilters-list')

    def test_assign_to_request_user(self):
        """Ensure that new filters are created with the request user as the owner"""
        params = """{
            "label": "Test filter",
            "filter_json": {"test key": "test value"}
        }"""
        response = self.client.post(self.list_url, params, content_type='application/json')
        response_data = json.loads(response.content)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_data['owner'], self.user.id)

    def test_view_only_own_filters(self):
        """Ensure that users can see only their own filters"""
        new_user = User.objects.create_user('test2', 'test2@test.com', 'test2')
        SavedFilter.objects.create(filter_json={"key": "value"}, label="A label", owner=new_user)

        # self.user doesn't have any filters, expect 0
        response = self.client.get(self.list_url)
        self.assertEqual(len(json.loads(response.content)['results']), 0)

        # New user has a filter, expect 1
        new_client = APIClient()
        new_client.force_authenticate(user=new_user)
        response = new_client.get(self.list_url)
        self.assertEqual(len(json.loads(response.content)['results']), 1)
