# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('black_spots', '0006_auto_20160525_0111'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='blackspotconfig',
            name='id',
        ),
        migrations.AddField(
            model_name='blackspotconfig',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2016, 5, 24, 19, 19, 56, 339703, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='blackspotconfig',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2016, 5, 24, 19, 20, 3, 683051, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='blackspotconfig',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
    ]
