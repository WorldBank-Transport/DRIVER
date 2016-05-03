import glob
import os
import shutil
import subprocess

from django.conf import settings

from celery import shared_task
from celery.utils.log import get_task_logger

import requests


logger = get_task_logger(__name__)


@shared_task
def load_road_network(output_root=None, output_srid='EPSG:3395'):
    """Downloads OpenStreetMap data to a Shapefile by using an OSM extract PBF file.

    Args:
        output_root (string): Absolute path of directory to output to; default current directory
        output_srid (string): Transform Shapefile output to this SRID; default 'EPSG:3395'
    Returns:
        Path to OSM data as shapefile.
    """
    if not output_root:
        output_root = os.getcwd()
    osm_path = os.path.join(output_root, 'road_network.osm.pbf')
    # Download OSM data
    try:
        with open(osm_path, 'wb') as osm_fh:
            logger.info('Downloading OSM extract')
            response = requests.get(settings.OSM_EXTRACT_URL, stream=True)
            response.raise_for_status()
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    osm_fh.write(chunk)
            osm_fh.flush()

        # Convert from OSM XML to a Shapefile using ogr2ogr
        logger.info('Converting to Shapefile')
        cmd_args = ['ogr2ogr', '-overwrite', '-skipfailures',
                    '-f', 'ESRI Shapefile', '-s_srs', 'EPSG:4326', '-t_srs', output_srid,
                    '-lco', 'ENCODING=UTF-8',
                    os.path.join(output_root, 'road_network'), osm_path]

        subprocess.check_call(cmd_args)
        # Move lines.* to output root and remove shapefile folder, OSM extract
        for f in glob.glob(os.path.join(output_root, 'road_network', 'lines.*')):
            shutil.move(f, output_root)
    finally:
        try:
            shutil.rmtree(os.path.join(output_root, 'road_network'))
        except OSError:
            pass
        try:
            os.remove(osm_path)
        except OSError:
            pass
    return os.path.join(output_root, 'lines.shp')
