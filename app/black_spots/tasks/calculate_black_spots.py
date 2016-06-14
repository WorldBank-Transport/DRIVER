import datetime
import os
import shutil
import tarfile
import tempfile

from django.conf import settings
from django.utils import timezone

from celery import shared_task, chain
from celery.utils.log import get_task_logger

from ashlar.models import RecordType

from black_spots.tasks import (forecast_segment_incidents, load_blackspot_geoms,
                               load_road_network, get_training_noprecip)
from black_spots.tasks.get_segments import get_segments_shp, create_segments_tar
from black_spots.models import BlackSpotTrainingCsv, RoadSegmentsShapefile, BlackSpotConfig
from data.tasks.fetch_record_csv import export_records

logger = get_task_logger(__name__)


@shared_task
def calculate_black_spots(history_length=datetime.timedelta(days=5 * 365 + 1), roads_srid=3395):
    """Integrates all black spot tasks into a pipeline
    Args:
        history_length (timedelta): Length of time to use for querying for historic records.
                                    Note: the R script will fail if it doesn't have a certain
                                    amount of data, which is why this is set to 5 years.
                                    TODO: make the R script more robust, so it can handle a
                                    dynamic number of years without failure.
        roads_srid (int): SRID in which to deal with the Roads data
    """
    config = BlackSpotConfig.objects.all().order_by('pk').first()
    if not config:
        logger.warn('BlackSpots are not fully configured; set a percentile cutoff first.')
        return
    # Get the parameters we'll use to filter down the records we want
    now = timezone.now()
    oldest = now - history_length
    # Note that this assumes that the RecordType with this label to be used will also be marked as
    # `active`. The `load_incidents` script ensures only the most recent record type is set as such.
    record_type = RecordType.objects.filter(
        label=settings.BLACKSPOT_RECORD_TYPE_LABEL,
        active=True
    ).first()
    segments_shp_obj = RoadSegmentsShapefile.objects.all().order_by('-created').first()
    if segments_shp_obj:
        # Get the UUID, since that is what is used when passing to tasks in the chain
        segments_shp_uuid = str(segments_shp_obj.uuid)

    # - Get events CSV. This is obtained before the road network segments are calculated
    # as an optimization, so we can ignore roads that won't have any associated records.
    records_csv_obj_id = export_records(oldest, now, record_type.pk)

    # Refresh road segments if the most recent one is more than 30 days out of date
    if not segments_shp_obj or (now - segments_shp_obj.created > datetime.timedelta(days=30)):
        # Celery callbacks prepend the result of the parent function to the callback's arg list
        segments_chain = chain(load_road_network.s(output_srid='EPSG:{}'.format(roads_srid)),
                               get_segments_shp.s(records_csv_obj_id, roads_srid),
                               create_segments_tar.s())()
        segments_shp_uuid = segments_chain.get()

    # - Match events to segments shapefile
    blackspots_output = get_training_noprecip.delay(segments_shp_uuid,
                                                    records_csv_obj_id,
                                                    roads_srid).get()

    # - Run Rscript to output CSV
    segments_csv = BlackSpotTrainingCsv.objects.get(pk=blackspots_output).csv.path
    forecasts_csv = forecast_segment_incidents(segments_csv, '/var/www/media/forecasts.csv')
    # - Load blackspot geoms from shapefile and CSV
    # The shapefile is stored as a gzipped tarfile so we need to extract it
    tar_output_dir = tempfile.mkdtemp()
    try:
        shp_tar = RoadSegmentsShapefile.objects.get(uuid=segments_shp_uuid).shp_tgz.path
        with tarfile.open(shp_tar, "r:gz") as tar:
            tar.extractall(tar_output_dir)
            load_blackspot_geoms(os.path.join(tar_output_dir, 'segments', 'combined_segments.shp'),
                                 forecasts_csv, record_type.pk, roads_srid,
                                 output_percentile=config.severity_percentile_threshold)
    finally:
        shutil.rmtree(tar_output_dir)
