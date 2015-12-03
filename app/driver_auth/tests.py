from mock import Mock, MagicMock

from django.conf import settings
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.request import Request

from driver_auth.permissions import IsOwnerOrAdmin


class PermissionsTestCase(TestCase):
    def test_isowneroradmin(self):
        owner_or_admin = IsOwnerOrAdmin()

        # Mock out some stuff
        request = Mock(spec=Request)
        user, created = User.objects.get_or_create(username='foo')
        other_user, created = User.objects.get_or_create(username='bar')
        admin_group, created = Group.objects.get_or_create(name=settings.DRIVER_GROUPS['ADMIN'])
        request.user = user
        obj = MagicMock()
        obj.owner = user

        # public user can access owned object
        self.assertTrue(owner_or_admin.has_object_permission(request, MagicMock(), obj))

        # public user cannot access unowned object
        request.user = other_user
        self.assertFalse(owner_or_admin.has_object_permission(request, MagicMock(), obj))

        # admin user can access unowned object
        other_user.groups.add(admin_group)
        self.assertTrue(owner_or_admin.has_object_permission(request, MagicMock(), obj))
