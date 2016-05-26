# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0008_recordcostconfig'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recordcostconfig',
            name='id',
        ),
        migrations.AddField(
            model_name='recordcostconfig',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2016, 5, 24, 19, 20, 20, 589258, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recordcostconfig',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2016, 5, 24, 19, 20, 28, 596369, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recordcostconfig',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
    ]
