from djangooidc.backends import OpenIdConnectBackend
from rest_framework.authtoken.models import Token


class DriverOpeIdConnectBackend(OpenIdConnectBackend):
    """
    Override default OIDC behavior to create auth token cookie for the frontend after login.
    """

    def configure_user(self, user):
        """
        Configures a user after creation and returns the updated user.

        Default behavior is to return the user unmodified;
        override to also create auth token for user.
        """
        if user:
            Token.objects.create(user=user)
        return user
