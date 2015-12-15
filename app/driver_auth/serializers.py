from django.contrib.auth.models import User, Group
from rest_framework.authtoken.models import Token
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):

    # display groups by name
    groups = serializers.StringRelatedField(many=True)

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
