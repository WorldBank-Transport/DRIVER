from rest_framework import viewsets

from black_spots.models import (BlackSpot, BlackSpotSet)
from black_spots.serializers import (BlackSpotSerializer, BlackSpotSetSerializer)
from black_spots.filters import (BlackSpotFilter, BlackSpotSetFilter)

from driver_auth.permissions import IsAdminOrReadOnly


class BlackSpotViewSet(viewsets.ModelViewSet):
    """ViewSet for black spots"""
    queryset = BlackSpot.objects.all()
    serializer_class = BlackSpotSerializer
    filter_class = BlackSpotFilter
    permission_classes = (IsAdminOrReadOnly,)


class BlackSpotSetViewSet(viewsets.ModelViewSet):
    """ViewSet for black spot sets"""
    queryset = BlackSpotSet.objects.all()
    serializer_class = BlackSpotSetSerializer
    filter_class = BlackSpotSetFilter
    permission_classes = (IsAdminOrReadOnly,)
