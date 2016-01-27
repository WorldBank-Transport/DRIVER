from django.conf import settings

from celery import shared_task
from celery.utils.log import get_task_logger


logger = get_task_logger(__name__)

@shared_task
def remove_duplicates():
    pass
