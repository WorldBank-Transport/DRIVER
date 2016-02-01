
from django.core.management.base import BaseCommand

from black_spots.tasks.calculate_black_spots import calculate_black_spots


class Command(BaseCommand):
    help = 'Calculate black spots'

    def handle(self, *args, **options):
        calculate_black_spots()
