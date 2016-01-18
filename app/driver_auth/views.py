from urllib import quote
from urlparse import parse_qs

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.shortcuts import redirect

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response

from djangooidc.oidc import OIDCError
from djangooidc.views import CLIENTS

from ashlar.pagination import OptionalLimitOffsetPagination

from driver_auth.serializers import UserSerializer, GroupSerializer
from driver_auth.permissions import IsAdminOrReadSelfOnly, IsAdminOrReadOnly, is_admin_or_writer

# match what auth-service.js looks for
USER_ID_COOKIE = 'AuthService.userId'
TOKEN_COOKIE = 'AuthService.token'
CAN_WRITE_COOKIE = 'AuthService.canWrite'


def authz_cb(request):
    """
    Based on OIDC callback:
    https://github.com/marcanpilami/django-oidc/blob/master/djangooidc/views.py

    Overriden to set auth token cookie for client; still logs in session as well.
    """

    client = CLIENTS[request.session["op"]]
    query = None

    try:
        query = parse_qs(request.META['QUERY_STRING'])
        userinfo = client.callback(query, request.session)
        request.session["userinfo"] = userinfo
        user = authenticate(**userinfo)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            # set session cookie for frontend
            response = redirect(request.session['next'])
            response.set_cookie(USER_ID_COOKIE, token.user_id)
            # set cookie for frontend write access (will be false by default)
            if is_admin_or_writer(user):
                response.set_cookie(CAN_WRITE_COOKIE, 'true')
            response.set_cookie(TOKEN_COOKIE, quote('"' + token.key + '"', safe=''))
            return response
        else:
            # authentication failed
            # return 403 here instead of raising error
            return JsonResponse({'error': 'this login is not valid in this application'},
                            status=403)
    except OIDCError as err:
        return JsonResponse({'error': err, 'callback': query}, status=400)


# helper to return list of available SSO clients
def get_oidc_client_list(request):
    return JsonResponse({'clients': CLIENTS.keys()})


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    serializer_class = UserSerializer
    permission_classes = (IsAdminOrReadSelfOnly,)
    queryset = User.objects.all().order_by('-date_joined')
    pagination_class = OptionalLimitOffsetPagination

    def get_queryset(self):
        """Limit non-admin users to only see their own info"""
        user = self.request.user
        if user.is_staff:
            return self.queryset
        else:
            return self.queryset.filter(id=user.id)


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = (IsAdminOrReadOnly,)
    pagination_class = OptionalLimitOffsetPagination


class DriverObtainAuthToken(ObtainAuthToken):
    def post(self, request):
        serializer = self.serializer_class(data=request.DATA)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': token.user_id})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


obtain_auth_token = DriverObtainAuthToken.as_view()
