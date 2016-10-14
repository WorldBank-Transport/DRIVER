"""
Django settings for DRIVER project development

Override base settings.py

"""

from driver.settings import *

# The only difference (currently) between this and the production settings is
# that CONN_MAX_AGE = 0.
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('DRIVER_DB_NAME', 'postgres'),
        'HOST': os.environ.get('DRIVER_DB_HOST', 'localhost'),
        'PORT': os.environ.get('DRIVER_DB_PORT', 5432),
        'USER': os.environ.get('DRIVER_DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DRIVER_DB_PASSWORD', 'postgres'),
        'CONN_MAX_AGE': 0,  # in seconds
        'OPTIONS': {
            'sslmode': 'require'
        }
    }
}
