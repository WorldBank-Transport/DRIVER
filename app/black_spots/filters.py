import django_filters

from dateutil.parser import parse

from django.db.models import Q

from ashlar.exceptions import QueryParameterException

from black_spots.models import (BlackSpot, BlackSpotSet)


class BlackSpotFilter(django_filters.FilterSet):
    """Filter for black spots"""
    class Meta:
        model = BlackSpot
        fields = ['black_spot_set']


class BlackSpotSetFilter(django_filters.FilterSet):
    """Filter for black spots sets"""

    effective_at = django_filters.MethodFilter(name='effective_at', action='filter_effective_at')

    def filter_effective_at(self, queryset, effective_at_str):
        """Method filter for effective datetime specified by effective_at"""
        if not effective_at_str:
            return queryset
        try:
            effective_at_dt = parse(effective_at_str)
        except:
            raise QueryParameterException('effective_at', 'ISO 8601 formatted.')

        if not effective_at_dt.tzinfo:
            raise QueryParameterException('effective_at', 'timezone aware.')

        return queryset.filter(
            Q(effective_end__isnull=True) | Q(effective_end__gt=effective_at_dt),
            effective_start__lte=effective_at_dt
        )

    class Meta:
        model = BlackSpotSet
        fields = ['record_type']
