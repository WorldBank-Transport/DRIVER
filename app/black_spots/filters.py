import django_filters

from dateutil.parser import parse

from django.db.models import Q

from grout.exceptions import QueryParameterException
from grout.models import BoundaryPolygon

from black_spots.models import (BlackSpot, BlackSpotSet)

from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.db import models as gis_models

from rest_framework.exceptions import ParseError, NotFound
from rest_framework_gis.filterset import GeoFilterSet


FILTER_OVERRIDES = {
    gis_models.PolygonField: {
        'filter_class': django_filters.CharFilter
    }
}

def parse_and_validate_dt(dt_str, param_name):
    """
    Helper for parsing a datetime string and ensuring it's time-zone aware
    :param dt_str:  datetime string
    :param param_name:  name of the parameter -- used for creating useful exception messages
    """
    try:
        dt = parse(dt_str)
    except:
        raise QueryParameterException(param_name, 'ISO 8601 formatted.')

    if not dt.tzinfo:
        raise QueryParameterException(param_name, 'timezone aware.')

    return dt


class BlackSpotFilter(django_filters.FilterSet):
    """Filter for black spots"""

    polygon = django_filters.Filter(field_name='polygon', method='filter_polygon')

    def filter_polygon(self, queryset, field_name, geojson):
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

    effective_at = django_filters.Filter(field_name='effective_at', method='filter_effective_at')

    def filter_effective_at(self, queryset, field_name, effective_at_str):
        """Method filter for effective datetime specified by effective_at"""
        if not effective_at_str:
            return queryset

        effective_at_dt = parse_and_validate_dt(effective_at_str, 'effective_at')

        return queryset.filter(
            Q(effective_end__isnull=True) | Q(effective_end__gt=effective_at_dt),
            effective_start__lte=effective_at_dt
        )

    class Meta:
        model = BlackSpotSet
        fields = ['record_type']


class EnforcerAssignmentFilter(GeoFilterSet):
    """Filter for enforcer assignments"""

    record_type = django_filters.Filter(field_name='record_type', method='filter_record_type')
    polygon = django_filters.Filter(field_name='polygon', method='filter_polygon')
    polygon_id = django_filters.Filter(field_name='polygon_id', method='filter_polygon_id')
    shift_end = django_filters.Filter(field_name='shift_end', method='filter_shift_end')

    def filter_polygon(self, queryset, field_name, geojson):
        """Method filter for arbitrary polygon, sent in as geojson"""
        try:
            poly = GEOSGeometry(geojson)
        except ValueError as e:
            raise ParseError(e)
        if poly.valid:
            return queryset.filter(geom__intersects=poly)
        else:
            raise ParseError('Input polygon must be valid GeoJSON: ' + poly.valid_reason)

    def filter_polygon_id(self, queryset, field_name, poly_uuid):
        """Method filter for containment within the polygon using id"""
        try:
            return queryset.filter(geom__intersects=BoundaryPolygon.objects.get(pk=poly_uuid).geom)
        except ValueError as e:
            raise ParseError(e)
        except BoundaryPolygon.DoesNotExist as e:
            raise NotFound(e)

    def filter_record_type(self, queryset, field_name, rt_id):
        """Method filter for record type"""
        return queryset.filter(black_spot_set__record_type=rt_id)

    def filter_shift_end(self, queryset, field_name, shift_end_str):
        """Method filter for shift end datetime"""
        shift_end_dt = parse_and_validate_dt(shift_end_str, 'shift_end')

        return queryset.filter(
            Q(black_spot_set__effective_end__isnull=True) |
            Q(black_spot_set__effective_end__gt=shift_end_dt),
            black_spot_set__effective_start__lte=shift_end_dt
        )

    class Meta:
        model = BlackSpot
        exclude = []
        filter_overrides = FILTER_OVERRIDES
