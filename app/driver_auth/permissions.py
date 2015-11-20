from rest_framework import permissions


class IsAdminOrReadSelfOnly(permissions.BasePermission):
    """
    Object-level user permission to only allow administrators to GET all users or POST any user;
    non-administrators have read-only access, to only their own user information.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated():
            return False

        if request.user.is_staff:
            return True

        # ensure non-administrative users have read-only access to list view
        if view.action == 'detail' or request.method in permissions.SAFE_METHODS:
            return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated():
            return False

        if request.user.is_staff:
            return True

        # read-only access to one's own user object for non-admin users
        if request.method in permissions.SAFE_METHODS and request.user == obj:
            return True

        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to authenticated non-administrators,
    and full access to administrators.
    """

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated():
            if request.method in permissions.SAFE_METHODS or request.user.is_staff:
                return True

        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access only to the user who created the object, and admins"""
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or request.user.is_staff
