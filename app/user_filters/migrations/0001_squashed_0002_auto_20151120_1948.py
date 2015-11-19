# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import djsonb.fields
import uuid


class Migration(migrations.Migration):

    replaces = [(b'user_filters', '0001_initial'), (b'user_filters', '0002_auto_20151120_1948')]

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedFilter',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('label', models.CharField(max_length=255)),
                ('filter_json', djsonb.fields.JsonField()),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
