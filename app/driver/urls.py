from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin

from rest_framework import routers

from black_spots import views as black_spot_views
from data import views as data_views
from driver_auth import views as auth_views
from user_filters import views as filt_views

router = routers.DefaultRouter()
router.register('audit-log', data_views.DriverRecordAuditLogViewSet)
router.register('blackspots', black_spot_views.BlackSpotViewSet, base_name='blackspots')
router.register('blackspotsets', black_spot_views.BlackSpotSetViewSet, base_name='blackspotsets')
router.register('boundaries', data_views.DriverBoundaryViewSet)
router.register('boundarypolygons', data_views.DriverBoundaryPolygonViewSet)
router.register('records', data_views.DriverRecordViewSet)
router.register('recordschemas', data_views.DriverRecordSchemaViewSet)
router.register('recordtypes', data_views.DriverRecordTypeViewSet)
router.register('duplicates', data_views.DriverRecordDuplicateViewSet)
router.register('userfilters', filt_views.SavedFilterViewSet, base_name='userfilters')


# user management
router.register(r'users', auth_views.UserViewSet)
router.register(r'groups', auth_views.GroupViewSet)

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(router.urls)),
    # get token for given username/password
    url(r'^api-token-auth/', auth_views.obtain_auth_token),
    url(r'^openid/clientlist/', auth_views.get_oidc_client_list, name='openid_client_list'),
    # override openid login callback endpoint by adding url here before djangooidc include
    url(r'^openid/callback/login/?$', auth_views.authz_cb, name='openid_login_cb'),
    # OIDC
    url(r'openid/', include('djangooidc.urls')),
]

# Allow login to the browseable API if in debug mode
if settings.DEVELOP:
    urlpatterns.append(url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')))
