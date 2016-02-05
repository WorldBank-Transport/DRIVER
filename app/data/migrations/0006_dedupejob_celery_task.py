# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0005_auto_20160205_2200'),
    ]

    operations = [
        migrations.AddField(
            model_name='dedupejob',
            name='celery_task',
            field=models.UUIDField(null=True),
        ),
    ]
