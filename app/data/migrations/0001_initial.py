# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('grout', '0021_add_weather_fields'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RecordAuditLogEntry',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('username', models.CharField(max_length=30)),
                ('record_uuid', models.CharField(max_length=36)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('action', models.CharField(max_length=6, choices=[(b'create', b'Create'), (b'update', b'Update'), (b'delete', b'Delete')])),
                ('record', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, to='grout.Record', null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, null=True)),
            ],
        ),
    ]
