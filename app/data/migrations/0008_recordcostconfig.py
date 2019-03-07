# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields.hstore


class Migration(migrations.Migration):

    dependencies = [
        ('grout', '0022_record_archived'),
        ('data', '0007_auto_20160525_0156'),
    ]

    operations = [
        migrations.CreateModel(
            name='RecordCostConfig',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('content_type_key', models.TextField()),
                ('property_key', models.TextField()),
                ('enum_costs', django.contrib.postgres.fields.hstore.HStoreField()),
                ('record_type', models.ForeignKey(to='grout.RecordType')),
            ],
        ),
    ]
