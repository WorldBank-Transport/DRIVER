# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings

from django.contrib.auth.models import Group, User


ADMIN_USER = {
    'email': settings.DEFAULT_ADMIN_EMAIL,
    'is_staff': True,
    'is_superuser': True,
    'username': settings.DEFAULT_ADMIN_USERNAME
}

def create_driver_groups(apps, schema_editor):
    for group_type in settings.DRIVER_GROUPS:
        group_name = settings.DRIVER_GROUPS[group_type]
        group = Group.objects.filter(name=group_name)
        if len(group) == 0:
            created_group = Group(name=group_name)
            created_group.save()

def delete_driver_groups(apps, schema_editor):
    for group_type in settings.DRIVER_GROUPS:
        group_name = settings.DRIVER_GROUPS[group_type]
        try:
            driver_group = Group.objects.get(name=group_name)
            driver_group.delete()
        except Group.DoesNotExist:
            pass

def create_default_admin(apps, schema_editor):
    admin_user = User.objects.filter(username=ADMIN_USER['username'])
    admin_group = Group.objects.get(name=settings.DRIVER_GROUPS['ADMIN'])
    if len(admin_user) == 0:
        default_admin = User(**ADMIN_USER)
        default_admin.set_password(settings.DEFAULT_ADMIN_PASSWORD)
        default_admin.save()
        default_admin.groups.add(admin_group)
        default_admin.save()

def delete_default_admin(apps, schema_editor):
    try:
        admin_user = User.objects.get(username=ADMIN_USER['username'])
        admin_user.delete()
    except User.DoesNotExist:
        pass


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunPython(create_driver_groups, delete_driver_groups),
        migrations.RunPython(create_default_admin, delete_default_admin),
    ]
