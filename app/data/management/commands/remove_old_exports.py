import os
import re
import time

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Delete old CSV export files'

    def add_arguments(self, parser):
        parser.add_argument('--max-age', type=int, default=6,
                            help="Oldest files to keep, in hours (default: 6).")

    def handle(self, *args, **options):
        exports_dir = settings.CELERY_EXPORTS_FILE_PATH
        min_mtime = time.time() - (options['max_age'] * 3600)
        for filename in os.listdir(exports_dir):
            filepath = os.path.join(exports_dir, filename)
            if (os.path.isfile(filepath) and re.search(r'\.tar\.gz$', filepath) and
                    os.path.getmtime(filepath) < min_mtime):
                os.remove(filepath)
