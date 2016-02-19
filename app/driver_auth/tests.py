import json
from mock import Mock, MagicMock

from django.conf import settings
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.request import Request
from rest_framework.test import APIClient

from driver_auth.permissions import IsOwnerOrAdmin, ReadersReadWritersWrite, IsAdminOrReadOnly
from driver_auth.views import UserViewSet


class UserViewTestCase(TestCase):
    def setUp(self):
        self.public = User.objects.create(username='public')

        self.admin = User.objects.create(username='isAnAdmin')
        admin_group = Group.objects.get(name=settings.DRIVER_GROUPS['ADMIN'])
        self.admin.groups.add(admin_group)

        self.client = APIClient()

    def test_get_queryset(self):
        """Test that queryset includes all users for admins"""
        url = '/api/users/'
        self.client.force_authenticate(user=self.admin)
        response = json.loads(self.client.get(url).content)
        self.assertEqual(len(response['results']), 3)  # Built-in admin always exists
        self.client.force_authenticate(user=self.public)
        response = json.loads(self.client.get(url).content)
        self.assertEqual(len(response['results']), 1)


class PermissionsTestCase(TestCase):
    def setUp(self):
        super(PermissionsTestCase, self).setUp()

        self.public_group = Group.objects.get(name=settings.DRIVER_GROUPS['READ_ONLY'])
        self.public_user = User.objects.create(username='public')

        self.analyst = User.objects.create(username='analyst')
        analyst_group = Group.objects.get(name=settings.DRIVER_GROUPS['READ_WRITE'])
        self.analyst.groups.add(analyst_group)

        self.admin = User.objects.get(username=settings.DEFAULT_ADMIN_USERNAME)

        self.request = Mock(spec=Request)

    def tearDown(self):
        self.public_user.delete()
        self.analyst.delete()

    def test_default_user_group(self):
        # new user should belong to public group and public group only by default
        self.assertEquals(self.public_user.groups.count(), 1)
        self.assertEquals(self.public_user.groups.first(), self.public_group)

    def test_isowneroradmin(self):
        owner_or_admin = IsOwnerOrAdmin()

        self.request.user = self.public_user
        obj = MagicMock()
        obj.owner = self.public_user

        # non-admin user can access owned object
        self.assertTrue(owner_or_admin.has_object_permission(self.request, MagicMock(), obj))

        # non-admin cannot access unowned object
        self.request.user = self.analyst
        self.assertFalse(owner_or_admin.has_object_permission(self.request, MagicMock(), obj))

        # admin user can access unowned object
        self.request.user = self.admin
        self.assertTrue(owner_or_admin.has_object_permission(self.request, MagicMock(), obj))

    def test_readers_read_writers_write(self):
        readers_writers = ReadersReadWritersWrite()

        # public user can read but not write record
        self.request.user = self.public_user
        self.request.method = 'GET'
        self.assertTrue(readers_writers.has_permission(self.request, MagicMock()))
        self.request.method = 'POST'
        self.assertFalse(readers_writers.has_permission(self.request, MagicMock()))

        # writer can read and write record
        self.request.user = self.analyst
        self.request.method = 'GET'
        self.assertTrue(readers_writers.has_permission(self.request, MagicMock()))
        self.request.method = 'POST'
        self.assertTrue(readers_writers.has_permission(self.request, MagicMock()))

        # admin can read and write record
        self.request.user = self.admin
        self.request.method = 'GET'
        self.assertTrue(readers_writers.has_permission(self.request, MagicMock()))
        self.request.method = 'POST'
        self.assertTrue(readers_writers.has_permission(self.request, MagicMock()))

    def admin_or_readonly(self):
        admin_or_readonly = IsAdminOrReadOnly()

        # public user can read but not write record
        self.request.user = self.public_user
        self.request.method = 'GET'
        self.assertTrue(admin_or_readonly.has_permission(self.request, MagicMock()))
        self.request.method = 'POST'
        self.assertFalse(admin_or_readonly.has_permission(self.request, MagicMock()))

        # analyst can read but not write record
        self.request.user = self.analyst
        self.request.method = 'GET'
        self.assertTrue(admin_or_readonly.has_permission(self.request, MagicMock()))
        self.request.method = 'POST'
        self.assertFalse(admin_or_readonly.has_permission(self.request, MagicMock()))

        # admin can read and write record
        self.request.user = self.admin
        self.request.method = 'GET'
        self.assertTrue(admin_or_readonly.has_permission(self.request, MagicMock()))
        self.request.method = 'POST'
        self.assertTrue(admin_or_readonly.has_permission(self.request, MagicMock()))
