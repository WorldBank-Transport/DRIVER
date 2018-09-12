# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('grout', '0021_add_weather_fields'),
        ('data', '0002_auto_20160126_0404'),
    ]

    operations = [
        migrations.CreateModel(
            name='DedupeJob',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('datetime', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('status', models.CharField(default=b'PENDING', max_length=8, choices=[(b'PENDING', b'Pending'), (b'STARTED', b'Started'), (b'SUCCESS', b'Success'), (b'ERROR', b'Error')])),
            ],
        ),
        migrations.CreateModel(
            name='RecordDuplicate',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('resolved', models.BooleanField(default=False)),
                ('job', models.ForeignKey(to='data.DedupeJob')),
                ('records', models.ManyToManyField(to='grout.Record')),
            ],
        ),
    ]
