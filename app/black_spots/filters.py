import django_filters

from dateutil.parser import parse

from django.db.models import Q

from ashlar.exceptions import QueryParameterException

from black_spots.models import (BlackSpot, BlackSpotSet)

from django.contrib.gis.geos import GEOSGeometry

from rest_framework.exceptions import ParseError


class BlackSpotFilter(django_filters.FilterSet):
    """Filter for black spots"""

    polygon = django_filters.MethodFilter(name='polygon', action='filter_polygon')

    def filter_polygon(self, queryset, geojson):
        """ Method filter for arbitrary polygon, sent in as geojson """
        poly = GEOSGeometry(geojson)
        if poly.valid:
            return queryset.filter(geom__intersects=poly)
        else:
            raise ParseError('Input polygon must be valid GeoJSON: ' + poly.valid_reason)

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
