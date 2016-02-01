from __future__ import absolute_import

from celery import shared_task, Task
from celery.utils.log import get_task_logger

from black_spots.tasks.calculate_black_spots import calculate_black_spots


