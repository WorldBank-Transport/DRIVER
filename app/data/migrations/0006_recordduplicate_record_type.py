# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ashlar', '0021_add_weather_fields'),
        ('data', '0005_auto_20160204_0322'),
    ]

    operations = [
        migrations.AddField(
            model_name='recordduplicate',
            name='record_type',
            field=models.ForeignKey(to='ashlar.RecordType', null=True),
        ),
    ]
