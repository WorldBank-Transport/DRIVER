import django_filters

from django.contrib.gis.db.models import Union
from django.contrib.gis.geos import GEOSGeometry
from django.core.exceptions import ValidationError
from django.db.models import Q

from django_redis import get_redis_connection
from rest_framework.exceptions import ParseError, NotFound

from models import RecordAuditLogEntry, RecordDuplicate
from driver_auth.permissions import is_admin_or_writer
from data.models import DriverRecord
from grout.models import Boundary
from grout.filters import RecordFilter


class RecordAuditLogFilter(django_filters.FilterSet):
    """Allow filtering audit log entries by user, record, min_date, max_date"""
    min_date = django_filters.IsoDateTimeFilter(name="date", lookup_expr='gte')
    max_date = django_filters.IsoDateTimeFilter(name="date", lookup_expr='lte')
    action = django_filters.ChoiceFilter(choices=RecordAuditLogEntry.ActionTypes.choices)

    class Meta:
        model = RecordAuditLogEntry
        fields = ['user', 'username', 'record', 'record_uuid', 'action', 'min_date', 'max_date']


class RecordDuplicateFilter(django_filters.FilterSet):
    record_type = django_filters.Filter(field_name='record_type', method='filter_record_type')

    def filter_record_type(self, queryset, value):
        """ Filter duplicates by the record type of their first record

        e.g. /api/duplicates/?record_type=44a51b83-470f-4e3d-b71b-e3770ec79772
        """
        return queryset.filter(record__schema__record_type=value)

    class Meta:
        model = RecordDuplicate
        fields = ['resolved', 'job', 'record_type']

WEATHER_CHOICES = [(c, c) for c in [
    'clear-day',
    'clear-night',
    'cloudy',
    'fog',
    'hail',
    'partly-cloudy-day',
    'partly-cloudy-night',
    'rain',
    'sleet',
    'snow',
    'thunderstorm',
    'tornado',
    'wind',
]]


class DriverRecordFilter(RecordFilter):
    """Extend RecordFilter to allow filtering on created date."""
    created_min = django_filters.IsoDateTimeFilter(name="created", lookup_expr='gte')
    created_max = django_filters.IsoDateTimeFilter(name="created", lookup_expr='lte')
    created_by = django_filters.Filter(field_name='created_by', method='filter_created_by')
    weather = django_filters.MultipleChoiceFilter(choices=WEATHER_CHOICES)
    archived = django_filters.BooleanFilter(name='archived')
    outside_boundary = django_filters.Filter(field_name='geom', method='filter_outside_boundary')

    def __init__(self, data=None, *args, **kwargs):
        # if filterset is bound, use initial values as defaults
        if data is not None:
            # get a mutable copy of the QueryDict
            data = data.copy()

            if not data.get('archived'):
                data['archived'] = "False"

        super(DriverRecordFilter, self).__init__(data, *args, **kwargs)

    def filter_outside_boundary(self, queryset, field_name, boundary_uuid):
        """Filter records that fall outside the specified boundary."""
        redis_conn = get_redis_connection('boundaries')
        bounds_hexewkb = redis_conn.get(boundary_uuid)
        one_month_seconds = 30 * 24 * 60 * 60
        if bounds_hexewkb is None:
            try:
                boundary = Boundary.objects.get(pk=boundary_uuid)
            except ValidationError:
                raise ParseError('outside_boundary was passed an invalid UUID')
            except Boundary.DoesNotExist:
                raise NotFound('Boundary not found')
            unioned_bounds = boundary.polygons.aggregate(all_polys=Union('geom'))['all_polys']
            # Full resolution is very slow, so simplify down to roughly 100m (DRIVER is in lat/lon).
            unioned_bounds = unioned_bounds.simplify(tolerance=0.001, preserve_topology=True)
            redis_conn.set(boundary_uuid, str(unioned_bounds.hexewkb), one_month_seconds)
        else:
            redis_conn.expire(boundary_uuid, one_month_seconds)
            unioned_bounds = GEOSGeometry(bounds_hexewkb)
        return queryset.exclude(geom__intersects=unioned_bounds)

    def filter_created_by(self, queryset, name, value):
        """ Filter records by the email or username of the creating user."""
        if not is_admin_or_writer(self.request.user):
            # Public users cannot filter by creating user
            return queryset

        return queryset.filter(
            Q(recordauditlogentry__action=RecordAuditLogEntry.ActionTypes.CREATE) &
            (Q(recordauditlogentry__username=value) |
             Q(recordauditlogentry__user__email=value))
        )

    class Meta:
        model = DriverRecord
        fields = ['created_min', 'created_max']
