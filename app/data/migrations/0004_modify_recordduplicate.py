# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('grout', '0021_add_weather_fields'),
        ('data', '0003_dedupejob_recordduplicate'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recordduplicate',
            name='records',
        ),
        migrations.AddField(
            model_name='recordduplicate',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2016, 2, 3, 18, 46, 27, 456980, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recordduplicate',
            name='duplicate_record',
            field=models.ForeignKey(related_name='duplicate_record', to='grout.Record', null=True),
        ),
        migrations.AddField(
            model_name='recordduplicate',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2016, 2, 3, 18, 46, 39, 255953, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recordduplicate',
            name='record',
            field=models.ForeignKey(related_name='record', to='grout.Record', null=True),
        ),
        migrations.AddField(
            model_name='recordduplicate',
            name='score',
            field=models.FloatField(default=0),
        ),
    ]
