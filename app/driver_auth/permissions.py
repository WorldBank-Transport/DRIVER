from rest_framework import permissions
from django.conf import settings
from django.contrib.auth.models import Group, User


# helpers to check for group membership
ADMIN_GROUP = settings.DRIVER_GROUPS['ADMIN']
READ_GROUP = settings.DRIVER_GROUPS['READ_ONLY']
WRITE_GROUP = settings.DRIVER_GROUPS['READ_WRITE']


def belongs_to_group(user, group):
    try:
        return user.groups.filter(name=group).exists()
    except (User.DoesNotExist, Group.DoesNotExist):
        return False


def is_reader_or_writer(user):
    try:
        return user.groups.filter(name__in=(READ_GROUP, WRITE_GROUP)).exists()
    except (User.DoesNotExist, Group.DoesNotExist):
        return False


def is_admin_or_writer(user):
    try:
        return user.groups.filter(name__in=(ADMIN_GROUP, WRITE_GROUP)).exists()
    except (User.DoesNotExist, Group.DoesNotExist):
        return False


def is_admin(user):
    return belongs_to_group(user, ADMIN_GROUP)


def is_writer(user):
    return belongs_to_group(user, WRITE_GROUP)


def is_reader(user):
    return belongs_to_group(user, READ_GROUP)


class IsAdminOrReadSelfOnly(permissions.BasePermission):
    """
    Permission for User objects.

    Object-level user permission to only allow administrators to GET all users or POST any user;
    non-administrators have read-only access, to only their own user information.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated():
            return False

        if is_admin(request.user):
            return True

        # ensure non-administrative users have read-only access to list view
        if view.action == 'detail' or request.method in permissions.SAFE_METHODS:
            return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated():
            return False

        if is_admin(request.user):
            return True

        # read-only access to one's own user object for non-admin users
        if request.method in permissions.SAFE_METHODS and request.user == obj:
            return True

        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to authenticated non-administrators (public or analyst roles),
    and full access only to administrators.
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated():
            if is_admin(request.user):
                return True

            if request.method in permissions.SAFE_METHODS and is_reader_or_writer(request.user):
                return True

        return False


class IsAdminAndReadOnly(permissions.BasePermission):
    """
    Allow read-only access to administrators; entries should be immutable
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated():
            if request.method in permissions.SAFE_METHODS and is_admin(request.user):
                return True
        return False


class ReadersReadWritersWrite(permissions.BasePermission):
    """
    Allow read-only access to readers group, and full access to writers or admins.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated():
            return False

        if is_admin_or_writer(request.user):
            return True

        if request.method in permissions.SAFE_METHODS and is_reader(request.user):
            return True

        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access only to the user who created the object, and admins"""
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or is_admin(request.user)
