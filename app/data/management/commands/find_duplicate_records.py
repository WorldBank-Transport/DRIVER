from django.core.management.base import BaseCommand

from data.tasks import find_duplicate_records


class Command(BaseCommand):
    help = 'Find duplicates'

    def handle(self, *args, **options):
        find_duplicate_records()
