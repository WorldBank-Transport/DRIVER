from django.db.models import IntegerField, DateTimeField, Transform


class WeekTransform(Transform):
    """A custom transform to turn a date field into the integer which represents its week's
    temporal rank in the year (e.g. January's first week has the value 1)"""
    lookup_name = 'week'

    def as_sql(self, compiler, connection):
        lhs, params = compiler.compile(self.lhs)
        return "Extract('WEEK' FROM %s)" % lhs, params

    @property
    def output_field(self):
        return IntegerField()


# Currently unused - potentially useful if we want to aggregate on our stepwise graph by month
class MonthTransform(Transform):
    """A custom transform to turn a date field into the integer which represents its month's
    temporal rank in the year (e.g. January has the value 1)"""
    lookup_name = 'week'

    def as_sql(self, compiler, connection):
        lhs, params = compiler.compile(self.lhs)
        return "Extract('MONTH' FROM %s)" % lhs, params

    @property
    def output_field(self):
        return IntegerField()


class YearTransform(Transform):
    """A custom transform to peel the year out from a postgres datetime field"""
    lookup_name = 'year'

    def as_sql(self, compiler, connection):
        lhs, params = compiler.compile(self.lhs)
        return "Extract('ISOYEAR' FROM %s)" % lhs, params

    @property
    def output_field(self):
        return IntegerField()


DateTimeField.register_lookup(MonthTransform)
DateTimeField.register_lookup(WeekTransform)
DateTimeField.register_lookup(YearTransform)
