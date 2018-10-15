from django.db import connection


class GenerateViewsetQuery(object):
    def generate_query_sql(self, request):
        qset = self.get_queryset()
        # apply filters
        # get sql for the query that should be run
        for backend in list(self.filter_backends):
            qset = backend().filter_queryset(request, qset, self)

        cursor = connection.cursor().cursor
        sql, params = qset.query.sql_with_params()
        # get properly escaped string representation of the query
        query_str = cursor.mogrify(sql, params)
        cursor.close()
        return query_str.decode('utf-8')
