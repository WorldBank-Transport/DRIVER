# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0004_modify_recordduplicate'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='dedupejob',
            options={'get_latest_by': 'datetime'},
        ),
    ]
