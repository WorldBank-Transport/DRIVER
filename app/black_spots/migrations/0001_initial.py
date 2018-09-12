# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('grout', '0021_add_weather_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlackSpot',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('geom', django.contrib.gis.db.models.fields.PolygonField(srid=4326)),
                ('severity_score', models.FloatField()),
                ('num_records', models.PositiveIntegerField()),
                ('num_severe', models.PositiveIntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='BlackSpotSet',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('effective_start', models.DateTimeField()),
                ('effective_end', models.DateTimeField(null=True, blank=True)),
                ('record_type', models.ForeignKey(to='grout.RecordType')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='blackspot',
            name='black_spot_set',
            field=models.ForeignKey(to='black_spots.BlackSpotSet'),
        ),
    ]
