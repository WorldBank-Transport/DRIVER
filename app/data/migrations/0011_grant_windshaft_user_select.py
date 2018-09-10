# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-09-07 20:08
from __future__ import unicode_literals

from django.db import migrations


GRANT_IF_WINDSHAFT_EXISTS = """
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   pg_catalog.pg_roles
    WHERE  rolname = 'windshaft'
  ) THEN
    GRANT SELECT ON %s TO windshaft;
  END IF;
END$$;
"""


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0010_auto_20160527_2236'),
    ]

    operations = [
        migrations.RunSQL([
            GRANT_IF_WINDSHAFT_EXISTS % 'auth_user',
            GRANT_IF_WINDSHAFT_EXISTS % 'data_recordauditlogentry',
        ])
    ]