# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recordauditlogentry',
            name='id',
        ),
        migrations.AddField(
            model_name='recordauditlogentry',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='recordauditlogentry',
            name='date',
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='recordauditlogentry',
            name='record_uuid',
            field=models.CharField(max_length=36, db_index=True),
        ),
        migrations.AlterField(
            model_name='recordauditlogentry',
            name='username',
            field=models.CharField(max_length=30, db_index=True),
        ),
    ]
