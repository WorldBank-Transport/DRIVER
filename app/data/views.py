from django.db import connection
from django.db.models import Case, When, IntegerField, Value, Count

from rest_framework.decorators import list_route
from rest_framework.response import Response

from ashlar import views


class DriverRecordViewSet(views.RecordViewSet):
    """Override base RecordViewSet from ashlar to provide aggregation and tiler integration"""
    def list(self, request, *args, **kwargs):
        # respond to `query` param with the SQL for the query, instead of the query results
        if 'query' in request.GET:
            qryset = self.get_queryset()
            # apply the filters
            for backend in list(self.filter_backends):
                qryset = backend().filter_queryset(request, qryset, self)

            cursor = connection.cursor().cursor
            sql, params = qryset.query.sql_with_params()
            # get properly escaped string representation of the query
            qrystr = cursor.mogrify(sql, params)
            cursor.close()

            return Response({'query': qrystr})
        else:
            return super(DriverRecordViewSet, self).list(self, request, *args, **kwargs)

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
