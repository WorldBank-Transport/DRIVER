# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('black_spots', '0003_roadsegmentsshapefile'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlackSpotTrainingCsv',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('csv', models.FileField(upload_to=b'training/blackspot/')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='LoadForecastTrainingCsv',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('csv', models.FileField(upload_to=b'training/forecast')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
