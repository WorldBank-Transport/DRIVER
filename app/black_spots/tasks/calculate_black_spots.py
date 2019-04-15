import datetime
import os
import shutil
import tarfile
import tempfile

from django.conf import settings
from django.utils import timezone

from celery import shared_task
from celery.utils.log import get_task_logger

from grout.models import RecordType

from black_spots.tasks import (
    forecast_segment_incidents,
    load_blackspot_geoms,
    load_road_network,
    get_training_noprecip
)
from black_spots.tasks.get_segments import get_segments_shp, create_segments_tar
from black_spots.models import BlackSpotTrainingCsv, RoadSegmentsShapefile, BlackSpotConfig
from data.tasks.fetch_record_csv import export_records


logger = get_task_logger(__name__)

COMBINED_SEGMENTS_SHP_NAME = os.getenv('COMBINED_SEGMENTS_SHP_NAME', 'combined_segments.shp')


def get_latest_segments_tar_uuid(roads_srid, records_csv_obj_id):
    cutoff = timezone.now() - datetime.timedelta(days=30)
    segments_shp_obj = RoadSegmentsShapefile.objects.all().order_by('-created').first()

    # Refresh road segments if the most recent one is more than 30 days out of date
    if segments_shp_obj and segments_shp_obj.created > cutoff:
        logger.info("Using existing RoadSegmentsShapefile")
        return str(segments_shp_obj.uuid)

    logger.info("Creating new RoadSegmentsShapefile")

    logger.info("Loading road network")
    lines_shp_path = load_road_network(output_srid='EPSG:{}'.format(roads_srid))

    logger.info("Creating segments shape files")
    shp_output_dir = get_segments_shp(lines_shp_path, records_csv_obj_id, roads_srid)

    logger.info("Compressing shape files into tarball")
    return create_segments_tar(shp_output_dir)


def get_forecast_csv_path(segments_shp_uuid, records_csv_obj_id, roads_srid):
    # - Match events to segments shapefile
    blackspots_output = get_training_noprecip(
        segments_shp_uuid,
        records_csv_obj_id,
        roads_srid
    )

    # - Run Rscript to output CSV
    segments_csv = BlackSpotTrainingCsv.objects.get(pk=blackspots_output).csv.path
    return forecast_segment_incidents(segments_csv, '/var/www/media/forecasts.csv')


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
    try:
        severity_percentile_threshold = (
            BlackSpotConfig.objects.all().order_by('pk').first().severity_percentile_threshold
        )
    except AttributeError:
        logger.warn('BlackSpots are not fully configured; set a percentile cutoff first.')
        return
    # Get the parameters we'll use to filter down the records we want
    # Note that this assumes that the RecordType with this label to be used will also be marked as
    # `active`. The `load_incidents` script ensures only the most recent record type is set as such.
    record_type_pk = RecordType.objects.filter(
        label=settings.BLACKSPOT_RECORD_TYPE_LABEL,
        active=True
    ).first().pk

    # - Get events CSV. This is obtained before the road network segments are calculated
    # as an optimization, so we can ignore roads that won't have any associated records.
    now = timezone.now()
    oldest = now - history_length
    records_csv_obj_id = export_records(
        oldest,
        now,
        record_type_pk
    )

    # Get the UUID, since that is what is used when passing to tasks in the chain
    segments_shp_uuid = get_latest_segments_tar_uuid(
        roads_srid,
        records_csv_obj_id
    )

    forecasts_csv = get_forecast_csv_path(
        segments_shp_uuid,
        records_csv_obj_id,
        roads_srid
    )
    # - Load blackspot geoms from shapefile and CSV
    # The shapefile is stored as a gzipped tarfile so we need to extract it
    tar_output_dir = tempfile.mkdtemp()
    try:
        shp_tar = RoadSegmentsShapefile.objects.get(uuid=segments_shp_uuid).shp_tgz.path
        with tarfile.open(shp_tar, "r:gz") as tar:
            # TODO: Extract only the combined segments file, not the entire tarball
            tar.extractall(tar_output_dir)

        logger.info("Performing blackspot calculations")
        segments_path = os.path.join(tar_output_dir, 'segments', COMBINED_SEGMENTS_SHP_NAME)
        load_blackspot_geoms(
            segments_path,
            forecasts_csv,
            record_type_pk,
            roads_srid,
            output_percentile=severity_percentile_threshold
        )
    finally:
        shutil.rmtree(tar_output_dir)
