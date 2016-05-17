from __future__ import absolute_import

from celery import shared_task, Task
from celery.utils.log import get_task_logger

from black_spots.tasks.load_road_network import load_road_network
from black_spots.tasks.load_blackspot_geoms import load_blackspot_geoms
from black_spots.tasks.forecast_segment_incidents import forecast_segment_incidents
from black_spots.tasks.generate_training_input import get_training_noprecip, get_training_precip
from black_spots.tasks.get_segments import get_segments_shp

# This needs to be last because it depends on basically everything else
from black_spots.tasks.calculate_black_spots import calculate_black_spots
