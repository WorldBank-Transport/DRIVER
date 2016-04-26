# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('black_spots', '0002_blackspotrecordsfile'),
    ]

    operations = [
        migrations.CreateModel(
            name='RoadSegmentsShapefile',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('shp_tgz', models.FileField(upload_to=b'road_segments/')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
