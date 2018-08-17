import django_filters

from models import RecordAuditLogEntry, RecordDuplicate


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
