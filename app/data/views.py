import json
import uuid

from dateutil.parser import parse as parse_date
from datetime import timedelta

from celery import states

from django.conf import settings
from django.db import transaction
from django.db.models import (Case,
                              When,
                              IntegerField,
                              DateTimeField,
                              Value,
                              Count,
                              Q)
from django_redis import get_redis_connection

from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.exceptions import ParseError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework import renderers, status

from rest_framework_csv import renderers as csv_renderer

from ashlar.models import RecordSchema
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
from data.tasks import export_csv

import filters
from models import RecordAuditLogEntry, RecordDuplicate
from serializers import (DetailsReadOnlyRecordSerializer, DetailsReadOnlyRecordSchemaSerializer,
                         RecordAuditLogEntrySerializer, RecordDuplicateSerializer)
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
    def perform_destroy(self, instance):
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

    # Override default CSV field ordering and include URL
    def get_renderer_context(self):
        context = super(DriverRecordAuditLogViewSet, self).get_renderer_context()
        context['header'] = self.serializer_class.Meta.fields
        return context


def start_jar_build(schema_uuid):
    """Helper to kick off build of a Dalvik jar file with model classes for a schema.
    Publishes schema with its UUID to a redis channel that the build task listens on.

    :param schema_uuid: Schema UUID, which is the key used to store the jar on redis.
    """
    # Find the schema with the requested UUID.
    schema_model = RecordSchema.objects.get(uuid=schema_uuid)
    if not schema_model:
        return False

    schema = schema_model.schema
    redis_conn = get_redis_connection('jars')
    redis_conn.publish('jar-build', json.dumps({'uuid': schema_uuid, 'schema': schema}))
    return True


# override ashlar views to set permissions and trigger model jar builds
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

    def perform_create(self, serializer):
        instance = serializer.save()
        start_jar_build(str(instance.pk))

    def perform_update(self, serializer):
        instance = serializer.save()
        start_jar_build(str(instance.pk))

    def perform_destroy(self, instance):
        redis_conn = get_redis_connection('jars')
        redis_conn.delete(str(instance.pk))
        instance.delete()


class DriverBoundaryViewSet(BoundaryViewSet):
    permission_classes = (IsAdminOrReadOnly,)


class DriverRecordDuplicateViewSet(viewsets.ModelViewSet):
    queryset = RecordDuplicate.objects.all().order_by('record__occurred_to')
    serializer_class = RecordDuplicateSerializer
    permission_classes = (ReadersReadWritersWrite,)
    filter_class = filters.RecordDuplicateFilter

    @detail_route(methods=['patch'])
    def resolve(self, request, pk=None):
        duplicate = self.queryset.get(pk=pk)
        recordUUID = request.data.get('recordUUID', None)
        if recordUUID is None:
            # No record id means they want to keep both, so just resolve the duplicate
            duplicate.resolved = True
            duplicate.save()
            resolved_ids = [duplicate.pk]
        else:
            # If they picked a record, archive the other one and resolve all duplicates involving it
            # (which will include the current one)
            if recordUUID == str(duplicate.record.uuid):
                rejected_record = duplicate.duplicate_record
            elif recordUUID == str(duplicate.duplicate_record.uuid):
                rejected_record = duplicate.record
            else:
                raise Exception("Error: Trying to resolve a duplicate with an unconnected record.")
            rejected_record.archived = True
            rejected_record.save()
            resolved_dup_qs = RecordDuplicate.objects.filter(Q(resolved=False),
                                                             Q(record=rejected_record) |
                                                             Q(duplicate_record=rejected_record))
            resolved_ids = [str(uuid) for uuid in resolved_dup_qs.values_list('pk', flat=True)]
            resolved_dup_qs.update(resolved=True)
        return Response({'resolved': resolved_ids})


class RecordCsvExportViewSet(viewsets.ViewSet):
    """A view for interacting with CSV export jobs

    Since these jobs are not model-backed, we won't use any of the standard DRF mixins
    """
    permissions_classes = (IsAdminOrReadOnly,)

    def retrieve(self, request, pk=None):
        """Return the status of the celery task with query_params['taskid']"""
        # N.B. Celery will never return an error if a task_id doesn't correspond to a
        # real task; it will simply return a task with a status of 'PENDING' that will never
        # complete.
        job_result = export_csv.AsyncResult(pk)
        if job_result.state in states.READY_STATES:
            if job_result.state in states.EXCEPTION_STATES:
                e = job_result.get(propagate=False)
                return Response({'status': job_result.state, 'error': str(e)})
            # Set up the URL to proxy to the celery worker
            # TODO: This won't work with multiple celery workers
            # TODO: We should add a cleanup task to prevent result files from accumulating
            # on the celery worker.
            uri = '{scheme}://{host}{prefix}{file}'.format(scheme=request.scheme,
                                                           host=request.get_host(),
                                                           prefix=settings.CELERY_DOWNLOAD_PREFIX,
                                                           file=str(job_result.get()))
            return Response({'status': job_result.state, 'result': uri})
        return Response({'status': job_result.state, 'info': job_result.info})

    def create(self, request, *args, **kwargs):
        """Create a new CSV export task, using the passed filterkey as a parameter

        filterkey is the same as the "tilekey" that we pass to Windshaft; it must be requested
        from the Records endpoint using tilekey=true
        """
        filter_key = request.data.get('tilekey', None)
        if not filter_key:
            return Response({'errors': {'tilekey': 'This parameter is required'}},
                            status=status.HTTP_400_BAD_REQUEST)

        task = export_csv.delay(filter_key)
        return Response({'success': True, 'taskid': task.id}, status=status.HTTP_201_CREATED)

    # TODO: If we switch to a Django/ORM database backend, we can subclass AbortableTask
    # and allow cancellation as well.


class JarFileRenderer(renderers.BaseRenderer):
    """Renderer for downloading JARs.

    http://www.django-rest-framework.org/api-guide/renderers/#data
    """
    media_type = 'application/java-archive'
    charset = None
    render_style = 'binary'
    format = 'jar'

    def render(self, data, media_type=None, renderer_context=None, format=None):
        return data


class AndroidSchemaModelsViewSet(viewsets.ViewSet):
    """A view for interacting with Android jar build jobs."""

    permissions_classes = (IsAuthenticated,)
    renderer_classes = [JarFileRenderer] + api_settings.DEFAULT_RENDERER_CLASSES

    def finalize_response(self, request, response, *args, **kwargs):
        response = super(AndroidSchemaModelsViewSet, self).finalize_response(request, response, *args, **kwargs)
        if isinstance(response.accepted_renderer, JarFileRenderer):
            response['content-disposition'] = 'attachment; filename=models.jar'
        return response

    def retrieve(self, request, pk=None):
        """Return the model jar if found, or kick of a task to create it if not found.

        If a previous message has already been sent for the same UUID, the new request will be
        ignored by the subscriber, which processes requests serially.
        """

        uuid = str(pk)
        if not uuid:
            return Response({'errors': {'uuid': 'This parameter is required'}},
                            status=status.HTTP_400_BAD_REQUEST)

        redis_conn = get_redis_connection('jars')
        found_jar = redis_conn.get(uuid)
        if not found_jar:
            found = RecordSchema.objects.filter(uuid=uuid).count()
            if found == 1:
                # have a good schema UUID but no jar for it; go kick off a jar build
                start_jar_build(uuid)
                return Response({'success': True}, status=status.HTTP_201_CREATED)
            else:
                return Response({'errors': {'uuid': 'Schema matching UUID not found'}},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            # update cache expiry, then return the jar binary found in redis
            # to actually download the file, specify format=jar request parameter
            redis_conn.expire(uuid, settings.JARFILE_REDIS_TTL_SECONDS)
            return Response(found_jar)
