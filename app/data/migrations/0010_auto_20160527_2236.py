# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0009_auto_20160525_0320'),
    ]

    operations = [
        migrations.AddField(
            model_name='recordcostconfig',
            name='cost_prefix',
            field=models.CharField(max_length=6, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='recordcostconfig',
            name='cost_suffix',
            field=models.CharField(max_length=6, null=True, blank=True),
        ),
    ]
