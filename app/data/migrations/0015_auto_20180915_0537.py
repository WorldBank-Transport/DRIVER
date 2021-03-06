# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-09-14 21:37
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0014_drop_grout_record_fks'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recordduplicate',
            name='duplicate_record',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='duplicate_record', to='data.DriverRecord'),
        ),
        migrations.AlterField(
            model_name='recordduplicate',
            name='record',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='record', to='data.DriverRecord'),
        ),
    ]
