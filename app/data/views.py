import uuid

from django.db import connection
from django.db.models import Case, When, IntegerField, Value, Count

from django_redis import get_redis_connection

from rest_framework.decorators import list_route
from rest_framework.response import Response

from ashlar import views


class DriverRecordViewSet(views.RecordViewSet):
    """Override base RecordViewSet from ashlar to provide aggregation and tiler integration
    """
    def list(self, request, *args, **kwargs):
        # Don't generate a tile key unless the user specifically requests it, to avoid
        # filling up the Redis cache with queries that will never be viewed as tiles
        if ('tilekey' in request.query_params and
                request.query_params['tilekey'] in ['True', 'true']):
            response = Response(dict())
            query_sql = self._generate_query_sql(request)
            tile_token = uuid.uuid4()
            self._cache_tile_sql(tile_token, query_sql.encode('utf-8'))
            response.data['tilekey'] = tile_token
        else:
            response = super(DriverRecordViewSet, self).list(self, request, *args, **kwargs)
        return response

    @list_route(methods=['get'])
    def toddow(self, request):
        """ Return aggregations which nicely format the counts for time of day and day of week
        """
        qryset = self.get_queryset()
        for backend in list(self.filter_backends):
            qryset = backend().filter_queryset(request, qryset, self)

        # Build SQL `case` statement to annotate with the day of week
        dow_case = Case(*[When(occurred_from__week_day=x, then=Value(x))
                          for x in xrange(1, 8)], output_field=IntegerField())
        # Build SQL `case` statement to annotate with the time of day
        tod_case = Case(*[When(occurred_from__hour=x, then=Value(x))
                          for x in xrange(24)], output_field=IntegerField())
        annotated_recs = qryset.annotate(dow=dow_case).annotate(tod=tod_case)

        # Voodoo to perform aggregations over `tod` and `dow` combinations
        counted = (annotated_recs.values('tod', 'dow')
                   .order_by('tod', 'dow')
                   .annotate(count=Count('tod')))
        return Response(counted)

    def _generate_query_sql(self, request):
        """Generate the SQL used to generate a query response and return it as a string"""
        qset = self.get_queryset()
        # apply the filters
        for backend in list(self.filter_backends):
            qset = backend().filter_queryset(request, qset, self)

        cursor = connection.cursor().cursor
        sql, params = qset.query.sql_with_params()
        # get properly escaped string representation of the query
        query_str = cursor.mogrify(sql, params)
        cursor.close()
        return query_str

    def _cache_tile_sql(self, token, sql):
        """Stores a sql string in the common cache so it can be retrieved by Windshaft later"""
        # We need to use a raw Redis connection because the Django cache backend
        # transforms the keys and values before storing them. If the cached data
        # were being read by Django, this transformation would be reversed, but
        # since the stored sql will be parsed by Windshaft / Postgres, we need
        # to store the data exactly as it is.
        redis_conn = get_redis_connection('default')
        redis_conn.set(token, sql.encode('utf-8'))
