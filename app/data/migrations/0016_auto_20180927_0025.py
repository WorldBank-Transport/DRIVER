# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-09-26 16:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0015_auto_20180915_0537'),
    ]

    operations = [
        migrations.AddField(
            model_name='recordauditlogentry',
            name='log',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='recordauditlogentry',
            name='signature',
            field=models.BinaryField(null=True),
        ),
    ]