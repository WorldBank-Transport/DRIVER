from rest_framework import viewsets
from rest_framework.response import Response
from django_redis import get_redis_connection
from django.db import connection

from black_spots.models import (BlackSpot, BlackSpotSet)
from black_spots.serializers import (BlackSpotSerializer, BlackSpotSetSerializer)
from black_spots.filters import (BlackSpotFilter, BlackSpotSetFilter)

from driver_auth.permissions import IsAdminOrReadOnly

import uuid


class BlackSpotViewSet(viewsets.ModelViewSet):
    """ViewSet for black spots"""
    queryset = BlackSpot.objects.all()
    serializer_class = BlackSpotSerializer
    filter_class = BlackSpotFilter
    permission_classes = (IsAdminOrReadOnly, )

    def list(self, request, *args, **kwargs):
        # if tilekey if specified, use to get query
        response = Response(None)
        if ('tilekey' in request.query_params):
            tile_token = request.query_params['tilekey']
            redis_conn = get_redis_connection('default')
            sql = redis_conn.get(tile_token)
            if sql:
                tilekey_queryset = BlackSpot.objects.raw(sql)
                tilekey_serializer = BlackSpotSerializer(tilekey_queryset, many=True)
                tilekey_serializer.data.insert(0, {'count': len(tilekey_serializer.data)})
                response = Response(tilekey_serializer.data)
        else:
            response = super(BlackSpotViewSet, self).list(self, request, *args, **kwargs)
        return response

    def _generate_query_sql(self, request):
        qset = self.get_queryset()
        # apply filters
        # copy start
        # get sql for the BlackspotViewSet query that should be run
        for backend in list(self.filter_backends):
            qset = backend().filter_queryset(request, qset, self)

        cursor = connection.cursor().cursor
        sql, params = qset.query.sql_with_params()
        # get properly escaped string representation of the query
        query_str = cursor.mogrify(sql, params)
        cursor.close()
        return query_str
        # copy end


class BlackSpotSetViewSet(viewsets.ModelViewSet):
    """ViewSet for black spot sets"""
    queryset = BlackSpotSet.objects.all()
    serializer_class = BlackSpotSetSerializer
    filter_class = BlackSpotSetFilter
    permission_classes = (IsAdminOrReadOnly, )

    def list(self, request, *args, **kwargs):
        response = super(BlackSpotSetViewSet, self).list(self, request, *args, **kwargs)
        # If a polygon is passed as an argument, return a tilekey instead of a BlackSpotSet
        # Store the required SQL to filter Blackspots on that polygon
        if 'polygon' in request.query_params and len(response.data['results']) > 0:
            request.uuid = response.data['results'][0]['uuid']
            query_sql = BlackSpotViewSet()._generate_query_sql(request)
            tile_token = uuid.uuid4()
            redis_conn = get_redis_connection('default')
            redis_conn.set(tile_token, query_sql.encode('utf-8'))
            # return tile_token instead of the BlackspotSet uuid
            response = Response({'count': 1, 'results': [{'tilekey': tile_token}]})
        return response
