from grout.serializer_fields import JsonBField

from rest_framework.serializers import ModelSerializer

from user_filters.models import SavedFilter


class SavedFilterSerializer(ModelSerializer):
    # This is a bit of a misnomer since the model field is a JSONField, but there is
    # no difference between JSON and JSONB at the serialization level; both are represented
    # as dictionaries.
    filter_json = JsonBField()

    class Meta:
        model = SavedFilter
        read_only_fields = ('uuid', 'owner')
        fields = '__all__'
