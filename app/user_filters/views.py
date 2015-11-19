from rest_framework import viewsets

from user_filters.serializers import SavedFilterSerializer

from rest_framework.permissions import IsAuthenticated
from driver_auth.permissions import IsOwnerOrAdmin


class SavedFilterViewSet(viewsets.ModelViewSet):
    serializer_class = SavedFilterSerializer
    permission_classes = (IsAuthenticated, IsOwnerOrAdmin,)

    def get_queryset(self):
        return self.request.user.savedfilter_set.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
