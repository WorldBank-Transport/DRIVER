from mock import Mock, MagicMock

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.request import Request

from driver_auth.permissions import IsOwnerOrAdmin


class PermissionsTestCase(TestCase):
    def test_isowneroradmin(self):
        owner_or_admin = IsOwnerOrAdmin()

        # Mock out some stuff
        request = Mock(spec=Request)
        user = Mock(spec=User)
        request.user = user
        obj = MagicMock()
        obj.owner = user

        self.assertTrue(owner_or_admin.has_object_permission(request, MagicMock(), obj))

        request.user = MagicMock()
        request.user.is_staff = False
        self.assertFalse(owner_or_admin.has_object_permission(request, MagicMock(), obj))

        request.user.is_staff = True
        self.assertTrue(owner_or_admin.has_object_permission(request, MagicMock(), obj))
