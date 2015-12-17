from django.utils import six

from django.contrib.auth.models import User, Group
from rest_framework.authtoken.models import Token
from rest_framework import serializers



class GroupStringRelatedField(serializers.StringRelatedField):
    """
    StringRelatedField in DRF is read-only.
    Make it writeable for user groups, based on group name.
    """
    def to_internal_value(self, data):
        """
        Implement this field method so groups field may be writeable
        """
        if not isinstance(data, six.text_type):
            msg = 'Incorrect type. Expected a string, but got %s'
            raise serializers.ValidationError(msg % type(data).__name__)
        return Group.objects.get(name=data)


class UserSerializer(serializers.ModelSerializer):

    # display groups by name
    groups = GroupStringRelatedField(many=True)

    class Meta:
        model = User
        fields = ('id', 'url', 'username', 'email', 'groups', 'password', 'date_joined',
                  'is_staff', 'is_superuser',)
        read_only_fields = ('id',)
        write_only_fields = ('password',)

    def create(self, validated_data):
        groups = validated_data.pop('groups')
        password = validated_data.pop('password')
        user = User(**validated_data)
        if user:
            user.set_password(password)
            user.save()
            Token.objects.create(user=user)
            if groups:
                user.groups = groups
                user.save()
        return user


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'url', 'name')
        read_only_fields = ('id',)
