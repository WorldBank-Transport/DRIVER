# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('black_spots', '0004_blackspottrainingcsv_loadforecasttrainingcsv'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlackSpotConfig',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('severity_percentile_threshold', models.FloatField(default=0.95, validators=[django.core.validators.MaxValueValidator(1.0), django.core.validators.MinValueValidator(0.0)])),
            ],
        ),
    ]
