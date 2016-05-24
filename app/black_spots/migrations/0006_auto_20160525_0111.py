# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


def create_one_config(apps, schema_editor):
    BlackSpotConfig = apps.get_model('black_spots', 'BlackSpotConfig')
    if BlackSpotConfig.objects.all().count() < 1:
        BlackSpotConfig.objects.create()


def delete_all_configs(apps, schema_editor):
    BlackSpotConfig = apps.get_model('black_spots', 'BlackSpotConfig')
    BlackSpotConfig.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('black_spots', '0005_blackspotconfig'),
    ]

    operations = [
        migrations.RunPython(create_one_config, delete_all_configs)
    ]
