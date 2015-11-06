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


DateTimeField.register_lookup(WeekTransform)
