import uuid

from dateutil.parser import parse as parse_date
from datetime import timedelta

from django.db import connection, transaction
from django.db.models import (Case,
                              When,
                              IntegerField,
                              DateTimeField,
                              Value,
                              Count)

from django_redis import get_redis_connection

from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.settings import api_settings

from rest_framework_csv import renderers as csv_renderer

from ashlar.views import (BoundaryPolygonViewSet,
                          RecordViewSet,
                          RecordTypeViewSet,
                          RecordSchemaViewSet,
                          BoundaryViewSet)

from ashlar.serializers import RecordSerializer, RecordSchemaSerializer

from driver_auth.permissions import (IsAdminOrReadOnly,
                                     ReadersReadWritersWrite,
                                     IsAdminAndReadOnly,
                                     is_admin_or_writer)

import filters
from models import RecordAuditLogEntry
from serializers import (DetailsReadOnlyRecordSerializer, DetailsReadOnlyRecordSchemaSerializer,
                         RecordAuditLogEntrySerializer)
import transformers
from driver import mixins


DateTimeField.register_lookup(transformers.ISOYearTransform)
DateTimeField.register_lookup(transformers.WeekTransform)


class DriverRecordViewSet(RecordViewSet, mixins.GenerateViewsetQuery):
    """Override base RecordViewSet from ashlar to provide aggregation and tiler integration
    """
    permission_classes = (ReadersReadWritersWrite,)

    # Filter out everything except details for read-only users
    def get_serializer_class(self):
        if is_admin_or_writer(self.request.user):
            return RecordSerializer
        return DetailsReadOnlyRecordSerializer

    # Change auditing
    def add_to_audit_log(self, request, instance, action):
        """Creates a new audit log entry; instance must have an ID"""
        if not instance.pk:
            raise ValueError('Cannot create audit log entries for unsaved model objects')
        if action not in RecordAuditLogEntry.ActionTypes.as_list():
            raise ValueError("{} not one of 'create', 'update', or 'delete'".format(action))
        RecordAuditLogEntry.objects.create(user=request.user,
                                           username=request.user.username,
                                           record=instance,
                                           record_uuid=str(instance.pk),
                                           action=action)

    @transaction.atomic
    def perform_create(self, serializer):
        instance = serializer.save()
        self.add_to_audit_log(self.request, instance, RecordAuditLogEntry.ActionTypes.CREATE)

    @transaction.atomic
    def perform_update(self, serializer):
        instance = serializer.save()
        self.add_to_audit_log(self.request, instance, RecordAuditLogEntry.ActionTypes.UPDATE)

    @transaction.atomic
    def perform_delete(self, instance):
        self.add_to_audit_log(self.request, instance, RecordAuditLogEntry.ActionTypes.DELETE)
        instance.delete()

    # Views
    def list(self, request, *args, **kwargs):
        # Don't generate a tile key unless the user specifically requests it, to avoid
        # filling up the Redis cache with queries that will never be viewed as tiles
        if ('tilekey' in request.query_params and
                request.query_params['tilekey'] in ['True', 'true']):
            response = Response(dict())
            query_sql = self.generate_query_sql(request)
            tile_token = uuid.uuid4()
            self._cache_tile_sql(tile_token, query_sql.encode('utf-8'))
            response.data['tilekey'] = tile_token
        else:
            response = super(DriverRecordViewSet, self).list(self, request, *args, **kwargs)
        return response

    @list_route(methods=['get'])
    def stepwise(self, request):
        """Return an aggregation counts the occurrence of events per week (per year) between
        two bounding datetimes
        e.g. [{"week":35,"count":13,"year":2015},{"week":43,"count":1,"year":2015}]
        """
        # We'll need to have minimum and maximum dates specified to properly construct our SQL
        try:
            start_date = parse_date(request.query_params['occurred_min'])
            end_date = parse_date(request.query_params['occurred_max'])
        except KeyError:
            raise ParseError("occurred_min and occurred_max must both be provided")
        except ValueError:
            raise ParseError("occurred_min and occurred_max must both be valid dates")

        # The min year can't be after or more than 2000 years before the max year
        year_distance = end_date.year - start_date.year
        if year_distance < 0:
            raise ParseError("occurred_min must be an earlier date than occurred_max")
        if year_distance > 2000:
            raise ParseError("occurred_min and occurred_max must be within 2000 years of one another")

        queryset = self.get_queryset()
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)

        # Build SQL `case` statement to annotate with the year
        isoyear_case = Case(*[When(occurred_from__isoyear=year, then=Value(year))
                              for year in xrange(start_date.year, end_date.year + 1)],
                            output_field=IntegerField())
        # Build SQL `case` statement to annotate with the day of week
        week_case = Case(*[When(occurred_from__week=week, then=Value(week))
                           for week in xrange(1, 54)],
                         output_field=IntegerField())

        annotated_recs = queryset.annotate(year=isoyear_case).annotate(week=week_case)

        # Voodoo to perform aggregations over `week` and `year` combinations
        counted = (annotated_recs.values('week', 'year')
                   .order_by('week', 'year')
                   .annotate(count=Count('week')))

        return Response(counted)

    @list_route(methods=['get'])
    def toddow(self, request):
        """ Return aggregations which nicely format the counts for time of day and day of week
        e.g. [{"count":1,"dow":6,"tod":1},{"count":1,"dow":3,"tod":3}]
        """
        queryset = self.get_queryset()
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(request, queryset, self)

        # Build SQL `case` statement to annotate with the day of week
        dow_case = Case(*[When(occurred_from__week_day=x, then=Value(x))
                          for x in xrange(1, 8)], output_field=IntegerField())
        # Build SQL `case` statement to annotate with the time of day
        tod_case = Case(*[When(occurred_from__hour=x, then=Value(x))
                          for x in xrange(24)], output_field=IntegerField())
        annotated_recs = queryset.annotate(dow=dow_case).annotate(tod=tod_case)

        # Voodoo to perform aggregations over `tod` and `dow` combinations
        counted = (annotated_recs.values('tod', 'dow')
                   .order_by('tod', 'dow')
                   .annotate(count=Count('tod')))
        return Response(counted)

    def _cache_tile_sql(self, token, sql):
        """Stores a sql string in the common cache so it can be retrieved by Windshaft later"""
        # We need to use a raw Redis connection because the Django cache backend
        # transforms the keys and values before storing them. If the cached data
        # were being read by Django, this transformation would be reversed, but
        # since the stored sql will be parsed by Windshaft / Postgres, we need
        # to store the data exactly as it is.
        redis_conn = get_redis_connection('default')
        redis_conn.set(token, sql.encode('utf-8'))


class DriverRecordAuditLogViewSet(viewsets.ModelViewSet):
    """Viewset for accessing audit logs; will output CSVs if Accept text/csv is specified"""
    queryset = RecordAuditLogEntry.objects.all()
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES + [csv_renderer.CSVRenderer]
    serializer_class = RecordAuditLogEntrySerializer
    permission_classes = (IsAdminAndReadOnly,)
    filter_class = filters.RecordAuditLogFilter
    pagination_class = None

    def list(self, request, *args, **kwargs):
        """Validate filter params"""
        # Will throw an error if these are missing or not valid ISO-8601
        try:
            min_date = parse_date(request.query_params['min_date'])
            max_date = parse_date(request.query_params['max_date'])
        except KeyError:
            raise ParseError("min_date and max_date must both be provided")
        except ValueError:
            raise ParseError("occurred_min and occurred_max must both be valid dates")
        # Make sure that min_date and max_date are less than 32 days apart
        if max_date - min_date >= timedelta(days=32):
            raise ParseError('max_date and min_date must be less than one month apart')
        return super(DriverRecordAuditLogViewSet, self).list(request, *args, **kwargs)

    # Override default CSV field ordering for ease of use
    def get_renderer_context(self):
        context = super(DriverRecordAuditLogViewSet, self).get_renderer_context()
        context['header'] = ('date', 'username', 'record_uuid', 'action', 'uuid',)
        return context


# override ashlar views to set permissions
class DriverBoundaryPolygonViewSet(BoundaryPolygonViewSet):
    permission_classes = (IsAdminOrReadOnly,)


class DriverRecordTypeViewSet(RecordTypeViewSet):
    permission_classes = (IsAdminOrReadOnly,)


class DriverRecordSchemaViewSet(RecordSchemaViewSet):
    permission_classes = (IsAdminOrReadOnly,)

    # Filter out everything except details for read-only users
    def get_serializer_class(self):
        if is_admin_or_writer(self.request.user):
            return RecordSchemaSerializer
        return DetailsReadOnlyRecordSchemaSerializer


class DriverBoundaryViewSet(BoundaryViewSet):
    permission_classes = (IsAdminOrReadOnly,)
