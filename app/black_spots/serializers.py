from django.contrib.gis.geos import GEOSGeometry
from rest_framework.exceptions import ParseError, NotFound
from rest_framework.serializers import ModelSerializer

from grout.models import BoundaryPolygon
from black_spots.models import (BlackSpot, BlackSpotSet, BlackSpotConfig)
from black_spots.filters import parse_and_validate_dt


class BlackSpotSerializer(ModelSerializer):
    """Serializer for black spots"""
    class Meta:
        model = BlackSpot
        read_only_fields = ('uuid',)
        fields = '__all__'


class BlackSpotSetSerializer(ModelSerializer):
    """Serializer for black spot sets"""
    class Meta:
        model = BlackSpotSet
        read_only_fields = ('uuid',)
        fields = '__all__'


class BlackSpotConfigSerializer(ModelSerializer):
    """Serializer for singleton BlackSpotConfig object"""
    class Meta:
        model = BlackSpotConfig
        fields = '__all__'


class EnforcerAssignmentSerializer(ModelSerializer):
    """Serializer for enforcer assignments"""
    class Meta:
        model = BlackSpot
        fields = ('black_spot_set', 'geom', 'latitude', 'longitude', 'severity_score',)
        read_only_fields = ('uuid',)


class EnforcerAssignmentInputSerializer():
    """Serializer for enforcer assignment inputs"""

    def __init__(self, request):
        """
        Initialize the serializer object and perform validation

        :param request: The request object
        """
        self.num_personnel = self.get_required_int_param('num_personnel', request)
        self.shift_start = self.get_required_dt_param('shift_start', request)
        self.shift_end = self.get_required_dt_param('shift_end', request)
        self.record_type = self.get_required_param('record_type', request)

        # The geometry is optional. Check if the WKT polygon is defined first, then check by id.
        polygon = request.query_params.get('polygon', None)
        polygon_id = request.query_params.get('polygon_id', None)
        if polygon:
            try:
                self.geom = GEOSGeometry(polygon)
            except ValueError as e:
                raise ParseError(e)
            if not self.geom.valid:
                raise ParseError('Input polygon must be valid GeoJSON: ' + self.geom.valid_reason)
        elif polygon_id:
            try:
                self.geom = BoundaryPolygon.objects.get(pk=polygon_id).geom
            except ValueError as e:
                raise ParseError(e)
            except BoundaryPolygon.DoesNotExist as e:
                raise NotFound(e)
        else:
            self.geom = None

    def get_required_param(self, key, request):
        """
        Helper for getting a required string URL parameter value or raising a ParseError
        :param key:  URL parameter key
        :param request:  The request object
        """
        param_val = request.query_params.get(key, None)
        if not param_val:
            raise ParseError(detail="The '{}' parameter is required".format(key))
        return param_val

    def get_required_int_param(self, key, request):
        """
        Helper for getting a required int URL parameter value or raising a ParseError
        :param key:  URL parameter key
        :param request:  The request object
        """
        param_val = self.get_required_param(key, request)
        try:
            param_val = int(param_val)
        except ValueError:
            raise ParseError(detail="The '{}' parameter must be an integer".format(key))
        return param_val

    def get_required_int(self, key, request):
        """
        Helper for getting a required int URL parameter value or raising a ParseError
        :param key:  URL parameter key
        :param request:  The request object
        """
        param_val = self.get_required_param(key, request)
        try:
            param_val = int(param_val)
        except ValueError:
            raise ParseError(detail="The '{}' parameter must be an integer".format(key))
        return param_val

    def get_required_dt_param(self, key, request):
        """
        Helper for getting a required datetime URL parameter value or raising a ParseError
        :param key:  URL parameter key
        :param request:  The request object
        """
        param_val = self.get_required_param(key, request)
        return parse_and_validate_dt(param_val, key)
