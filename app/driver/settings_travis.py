
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
        'NAME': 'prs',
        'HOST': 'database',
        'PORT': 5432,
        'USER': 'prs',
        'PASSWORD': 'prs',
        'oauth_client_id': '',
        'oauth_client_secret': '',
        'CONN_MAX_AGE': 3600,  # in seconds
    }
}
