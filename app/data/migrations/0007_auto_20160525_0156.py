# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.postgres.operations import HStoreExtension


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0006_dedupejob_celery_task'),
    ]

    operations = [
        HStoreExtension()
    ]
