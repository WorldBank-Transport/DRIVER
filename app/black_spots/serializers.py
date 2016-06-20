from rest_framework.exceptions import ParseError
from rest_framework.serializers import ModelSerializer

from black_spots.models import (BlackSpot, BlackSpotSet, BlackSpotConfig)
from black_spots.filters import parse_and_validate_dt


class BlackSpotSerializer(ModelSerializer):
    """Serializer for black spots"""
    class Meta:
        model = BlackSpot
        read_only_fields = ('uuid',)


class BlackSpotSetSerializer(ModelSerializer):
    """Serializer for black spot sets"""
    class Meta:
        model = BlackSpotSet
        read_only_fields = ('uuid',)


class BlackSpotConfigSerializer(ModelSerializer):
    """Serializer for singleton BlackSpotConfig object"""
    class Meta:
        model = BlackSpotConfig


class EnforcerAssignmentSerializer(ModelSerializer):
    """Serializer for enforcer assignments"""
    class Meta:
        model = BlackSpot
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
