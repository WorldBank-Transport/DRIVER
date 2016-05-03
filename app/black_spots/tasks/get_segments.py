import fiona
import itertools
import logging
import os
import pytz
import rtree
import shutil
from math import ceil
import tarfile as t
import subprocess
import tempfile
import multiprocessing
from shapely.geometry import mapping, shape, LineString, MultiPoint, Point
from shapely.ops import unary_union

from django.core.files import File

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

from black_spots.models import RoadSegmentsShapefile

from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


INTERSECTION_BUFFER_UNITS = int(os.getenv('INTERSECTION_BUFFER_UNITS', '5'))
MAX_LINE_UNITS = int(os.getenv('MAX_LINE_UNITS', '200'))
RECORD_PROJECTION = os.getenv('RECORD_PROJECTION', 'epsg:4326')
TIMEZONE = pytz.timezone(os.getenv('TIMEZONE', 'Asia/Manila'))
MATCH_TOLERANCE = int(os.getenv('MATCH_TOLERANCE', '5'))
RECORD_COL_ID = os.getenv('RECORD_COL_ID', 'record_id')
RECORD_COL_X = os.getenv('RECORD_COL_X', 'lon')
RECORD_COL_Y = os.getenv('RECORD_COL_Y', 'lat')
RECORD_COL_OCCURRED = os.getenv('RECORD_COL_OCCURRED', 'occurred_from')
RECORD_COL_SEVERE = os.getenv('RECORD_COL_SEVERE', 'Severity')
RECORD_COL_SEVERE_VALS = os.getenv('RECORD_COL_SEVERE_VALS', 'Fatal,Injury')
RECORD_COL_PRECIP = os.getenv('RECORD_COL_PRECIP', 'weather')
RECORD_COL_PRECIP_VALS = os.getenv('RECORD_COL_PRECIP_VALS', 'rain,hail,sleet,snow,thunderstorm,tornado')
COMBINED_SEGMENTS_SHP_NAME = os.getenv('COMBINED_SEGMENTS_SHP_NAME', 'combined_segments.shp')
TILE_MAX_UNITS = int(os.getenv('TILE_MAX_UNITS', '3000'))


@shared_task
def get_segments_shp(path_to_roads_shp):
    """Save segments to a shapefile and save in model

    Args:
    :param path_to_roads_shp: (str) path to shapefile
    """
    try:
        logger.info('Reading Roads Shapefile: %s', path_to_roads_shp)
        roads, road_projection, road_bounds = read_roads(path_to_roads_shp)

        logger.info('Obtaining intersection buffers')
        int_buffers = get_intersection_buffers(roads, road_bounds, INTERSECTION_BUFFER_UNITS, TILE_MAX_UNITS)

        logger.info('Obtaining intersections')
        int_multilines, non_int_lines = get_intersection_parts(roads, int_buffers, MAX_LINE_UNITS)
        combined_segments = int_multilines + non_int_lines

        logger.info('Writing shapefile segments')
        shp_output_dir = tempfile.mkdtemp()
        tar_output_dir = tempfile.mkdtemp()

        segments_shp_path = os.path.join(shp_output_dir, COMBINED_SEGMENTS_SHP_NAME)
        write_segments_shp(segments_shp_path, road_projection, combined_segments)
        tarball_path = create_tarball(shp_output_dir, tar_output_dir)

        road_segments_shpfile = RoadSegmentsShapefile.objects.create()
        logger.info('Created database record: %s', road_segments_shpfile.uuid)

        with open(tarball_path, 'rb') as f:
            tarball_file = File(f)
            save_name = '{}.tgz'.format(road_segments_shpfile.uuid)
            logger.info('Saving tarball with django-storages: %s', tarball_path)
            road_segments_shpfile.shp_tgz.save(save_name, tarball_file)
    except:
        logger.exception('Error generating segments shapefile')
        raise
    finally:
        shutil.rmtree(shp_output_dir, True)
        shutil.rmtree(tar_output_dir, True)
    return road_segments_shpfile.uuid


def create_tarball(shp_dir, tar_dir):
    """Creates gzipped tarball of shapefile

    :params shp_dir: output directory of shapefile
    :params tar_dir: output directory for gzipped tarball
    """
    filename = 'road_segments.tar'
    tar_path = os.path.join(tar_dir, filename)
    tarball = t.TarFile(tar_path, 'w')
    tarball.add(shp_dir, arcname='segments')
    tarball.close()

    command = ['gzip', tar_path]
    subprocess.check_call(command)
    gzip_filepath = '{}.gz'.format(tar_path)
    return gzip_filepath


def get_intersections(roads):
    """Calculates the intersection points of all roads
    :param roads: List of shapely geometries representing road segments
    """
    intersections = []
    for road1, road2 in itertools.combinations(roads, 2):
        if road1.intersects(road2):
            intersection = road1.intersection(road2)
            if 'Point' == intersection.type:
                intersections.append(intersection)
            elif 'MultiPoint' == intersection.type:
                intersections.extend([pt for pt in intersection])
            elif 'MultiLineString' == intersection.type:
                multiLine = [line for line in intersection]
                first_coords = multiLine[0].coords[0]
                last_coords = multiLine[len(multiLine)-1].coords[1]
                intersections.append(Point(first_coords[0], first_coords[1]))
                intersections.append(Point(last_coords[0], last_coords[1]))
            elif 'GeometryCollection' == intersection.type:
                intersections.extend(get_intersections(intersection))

    # The unary_union removes duplicate points
    unioned = unary_union(intersections)

    # Ensure the result is a MultiPoint, since calling functions expect an iterable
    if 'Point' == unioned.type:
        unioned = MultiPoint([unioned])

    return unioned


def read_roads(roads_shp):
    """Reads shapefile and extracts roads and projection
    :param roads_shp: Path to the shapefile containing roads
    """
    shp_file = fiona.open(roads_shp)
    roads = [
        shape(road['geometry'])
        for road in shp_file
        # We're only interested in non-bridge, non-tunnel highways
        # 'class' is optional, so only consider it when it's available.
        if ('class' not in road['properties'] or road['properties']['class'] == 'highway'
            and road['properties']['bridge'] == 0
            and road['properties']['tunnel'] == 0)
    ]
    return (roads, shp_file.crs, shp_file.bounds)


def get_intersection_buffers(roads, road_bounds, intersection_buffer_units, tile_max_units):
    """Buffers all intersections
    :param roads: List of shapely geometries representing road segments
    :param road_bounds: Bounding box of the roads shapefile
    :param intersection_buffer_units: Number of units to use for buffer radius
    :param tile_max_units: Maxium number of units for each side of a tile
    """
    # As an optimization, the road network is divided up into a grid of tiles,
    # and intersections are calculated within each tile.
    def roads_per_tile_iter():
        """Generator which yields a set of roads for each tile"""
        min_x, min_y, max_x, max_y = road_bounds
        bounds_width = max_x - min_x
        bounds_height = max_y - min_y
        x_divisions = ceil(bounds_width / tile_max_units)
        y_divisions = ceil(bounds_height / tile_max_units)
        tile_width = bounds_width / x_divisions
        tile_height = bounds_height / y_divisions

        # Create a spatial index for roads to efficiently match up roads to tiles
        logger.info('Generating spatial index for intersections')
        roads_index = rtree.index.Index()
        for idx, road in enumerate(roads):
            roads_index.insert(idx, road.bounds)

        logger.info('Number of tiles: {}'.format(int(x_divisions * y_divisions)))
        for x_offset in range(0, int(x_divisions)):
            for y_offset in range(0, int(y_divisions)):
                road_ids_in_tile = roads_index.intersection([
                    min_x + x_offset * tile_width,
                    min_y + y_offset * tile_height,
                    min_x + (1 + x_offset) * tile_width,
                    min_y + (1 + y_offset) * tile_height
                ])
                roads_in_tile = [roads[road_id] for road_id in road_ids_in_tile]
                if len(roads_in_tile) > 1:
                    yield roads_in_tile

    # Allocate one worker per core, and parallelize the discovery of intersections
    pool = multiprocessing.Pool(multiprocessing.cpu_count())
    tile_intersections = pool.imap(get_intersections, roads_per_tile_iter())
    pool.close()
    pool.join()

    logger.info('Buffering intersections')
    # Note: tile_intersections is a list of multipoints (which is a list of points).
    # itertools.chain.from_iterable flattens the list into a list of single points.
    buffered_intersections = [intersection.buffer(intersection_buffer_units)
                              for intersection in itertools.chain.from_iterable(tile_intersections)]

    # If intersection buffers overlap, union them to treat them as one
    logger.info('Performing unary union on buffered intersections')
    return unary_union(buffered_intersections)


def split_line(line, max_line_units):
    """Checks the line's length and splits in half if larger than the configured max
    :param line: Shapely line to be split
    :param max_line_units: The maximum allowed length of the line
    """
    if line.length <= max_line_units:
        return [line]

    half_length = line.length / 2
    coords = list(line.coords)
    for idx, point in enumerate(coords):
        proj_dist = line.project(Point(point))
        if proj_dist == half_length:
            return [LineString(coords[:idx + 1]), LineString(coords[idx:])]

        if proj_dist > half_length:
            mid_point = line.interpolate(half_length)
            head_line = LineString(coords[:idx] + [(mid_point.x, mid_point.y)])
            tail_line = LineString([(mid_point.x, mid_point.y)] + coords[idx:])
            return split_line(head_line, max_line_units) + split_line(tail_line, max_line_units)


def get_intersection_parts(roads, int_buffers, max_line_units):
    """Finds all segments that intersect the buffers, and all that don't
    :param roads: List of shapely geometries representing road segments
    :param int_buffers: List of shapely polygons representing intersection buffers
    :param max_line_units: The maximum allowed length of the line
    """

    # Create a spatial index for intersection buffers to efficiently find intersecting segments
    int_buffers_index = rtree.index.Index()
    for idx, intersection_buffer in enumerate(int_buffers):
        int_buffers_index.insert(idx, intersection_buffer.bounds)

    segments_map = {}
    non_int_lines = []
    for road in roads:
        road_int_buffers = []
        for idx in int_buffers_index.intersection(road.bounds):
            int_buffer = int_buffers[idx]
            if int_buffer.intersects(road):
                if idx not in segments_map:
                    segments_map[idx] = []
                segments_map[idx].append(int_buffer.intersection(road))
                road_int_buffers.append(int_buffer)

        # Collect the non-intersecting segments
        if len(road_int_buffers) > 0:
            diff = road.difference(unary_union(road_int_buffers))
            if 'LineString' == diff.type:
                non_int_lines.append(diff)
            elif 'MultiLineString' == diff.type:
                non_int_lines.extend([line for line in diff])
        else:
            non_int_lines.append(road)

    # Union all lines found within a buffer, treating them as a single unit
    int_multilines = [unary_union(lines) for _, lines in segments_map.items()]

    # Split any long non-intersecting segments. It's not important that they
    # be equal lengths, just that none of them are exceptionally long.
    split_non_int_lines = []
    for line in non_int_lines:
        split_non_int_lines.extend(split_line(line, max_line_units))

    # Return a tuple of intersection multilines and non-intersecting segments
    return (int_multilines, split_non_int_lines)


def write_segments_shp(segments_shp_path, road_projection, segments):
    """Writes all segments to shapefile (both intersections and individual segments)
    :param segments_shp_path: Path to shapefile to write
    :param road_projection: Projection of road data
    :param segments_with_data: List of tuples containing segments and segment data
    """

    schema = {
        'geometry': 'MultiLineString',
        'properties': {
            # Unique identifier for this segment
            'id': 'int',
            # Whether or not this is an intersection
            'inter': 'int',
            # Length of the segment
            'length': 'float',
            # Number of lines in the segment (measure of intersection complexity)
            'lines': 'int',
            # X-coordinate of segment centroid
            'pointx': 'float',
            # Y-coordinate of segment centroid
            'pointy': 'float'
        }
    }

    with fiona.open(segments_shp_path, 'w', driver='ESRI Shapefile',
                    schema=schema, crs=road_projection) as output:

        for idx, segment in enumerate(segments):
            is_intersection = 'MultiLineString' == segment.type
            data = {
                'id': idx,
                'inter': 1 if is_intersection else 0,
                'length': segment.length,
                'lines': len(segment) if is_intersection else 1,
                'pointx': segment.centroid.x,
                'pointy': segment.centroid.y,
            }
            output.write({
                'geometry': mapping(segment),
                'properties': data
            })
