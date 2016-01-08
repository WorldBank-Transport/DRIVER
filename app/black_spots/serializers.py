from rest_framework.serializers import ModelSerializer

from black_spots.models import (BlackSpot, BlackSpotSet)


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
