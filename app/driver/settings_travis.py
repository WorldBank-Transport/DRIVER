
"""
Django settings for DRIVER project testing.

Override base settings.py

"""

from driver.settings import *


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'postgres',
        'HOST': 'localhost',
        'PORT': 5432,
        'USER': 'postgres',
        'PASSWORD': '',
        'CONN_MAX_AGE': 3600,  # in seconds
    }
}
