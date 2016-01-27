
from django.core.management.base import BaseCommand

from data.tasks.remove_duplicates import remove_duplicates


class Command(BaseCommand):
    help = 'Remove duplicates'

    def handle(self, *args, **options):
        remove_duplicates.s()
