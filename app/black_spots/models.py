from django.conf import settings
from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from grout.models import GroutModel


class BlackSpot(GroutModel):
    """A black spot -- an area where there is an historical/statistical
    concentration of records
    """

    #: Buffered road segment polygon where black spot analysis is performed
    geom = models.PolygonField(srid=settings.GROUT['SRID'])

    #: Number that determines the severity of this black spot. May be used for color-coding on map.
    severity_score = models.FloatField()

    #: Number of records accounted for in the polygon while analyzing
    num_records = models.PositiveIntegerField()

    #: Number of severe records accounted for in the polygon while analyzing
    num_severe = models.PositiveIntegerField()

    #: The set of black spots this belongs to
    black_spot_set = models.ForeignKey('BlackSpotSet')

    #: The latitude of the black spot's centroid
    @property
    def latitude(self):
        """Gets the latitude of the black spot's centroid"""
        return self.geom.centroid.y

    #: The longitude of the black spot's centroid
    @property
    def longitude(self):
        """Gets the longitude of the black spot's centroid"""
        return self.geom.centroid.x


class BlackSpotSet(GroutModel):
    """A grouping of black spots generated at one time"""

    #: DateTime when the black spots become effective
    effective_start = models.DateTimeField()

    #: DateTime when the black spots are no longer effective.
    #  Should be null when first inserted.
    effective_end = models.DateTimeField(null=True, blank=True)

    #: The record type these black spots are associated with
    record_type = models.ForeignKey('grout.RecordType')


class BlackSpotConfig(GroutModel):
    """Holds user-configurable settings for how black spot generation should work"""
    #: Blackspot severity percentile cutoff; segments with forecast severity above this threshold
    #: will be considered blackspots.
    severity_percentile_threshold = models.FloatField(default=0.95,
                                                      validators=[MaxValueValidator(1.0),
                                                                  MinValueValidator(0.0)])


class BlackSpotRecordsFile(GroutModel):
    """Model to track blackspot record csvs"""
    #: Path to csvs
    csv = models.FileField(upload_to='blackspot_records/')


class RoadSegmentsShapefile(GroutModel):
    """Model to track gzipped shapefile for road segments training input"""

    #: Path to gzipped shapefile
    shp_tgz = models.FileField(upload_to='road_segments/')


class BlackSpotTrainingCsv(GroutModel):
    """Model to track blackspot training csvs"""

    #: Path to csvs
    csv = models.FileField(upload_to='training/blackspot/')


class LoadForecastTrainingCsv(GroutModel):
    """Model to track forecast training csvs"""
    #: Path to csvs
    csv = models.FileField(upload_to='training/forecast')
