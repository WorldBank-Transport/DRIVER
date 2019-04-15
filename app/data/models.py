import uuid
import hashlib

from django.db import models
from django.contrib.postgres.fields import HStoreField
from django.contrib.auth.models import User

from grout.models import GroutModel, Record, RecordType


class DriverRecord(Record):
    """Extend Grout Record model with custom fields"""
    weather = models.CharField(max_length=50, null=True, blank=True)
    light = models.CharField(max_length=50, null=True, blank=True)

    city = models.CharField(max_length=50, null=True, blank=True)
    city_district = models.CharField(max_length=50, null=True, blank=True)
    county = models.CharField(max_length=50, null=True, blank=True)
    neighborhood = models.CharField(max_length=50, null=True, blank=True)
    road = models.CharField(max_length=200, null=True, blank=True)
    state = models.CharField(max_length=50, null=True, blank=True)


class RecordAuditLogEntry(models.Model):
    """Records an occurrence of a Record being altered, who did it, and when.

    Note that 'user' and 'record' are maintained as foreign keys for convenience querying,
    but these fields can be set to NULL if the referenced object is deleted. If a user or
    record has been deleted, then 'username' or 'record_uuid' should be used, respectively.
    """
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Store both a foreign key and the username so that if the user is deleted this can still
    # be useful.
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    username = models.CharField(max_length=30, db_index=True)
    # Same for the record; if the record this refers to is deleted we still want to be able to
    # determine which audit log entries pertained to that record.
    record = models.ForeignKey(DriverRecord, null=True, on_delete=models.SET_NULL)
    record_uuid = models.CharField(max_length=36, db_index=True)

    date = models.DateTimeField(auto_now_add=True, db_index=True)

    class ActionTypes(object):
        CREATE = 'create'
        UPDATE = 'update'
        DELETE = 'delete'

        choices = (
            (CREATE, 'Create'),
            (UPDATE, 'Update'),
            (DELETE, 'Delete')
        )

        @classmethod
        def as_list(cls):
            return [cls.CREATE, cls.UPDATE, cls.DELETE]

    action = models.CharField(max_length=6, choices=ActionTypes.choices)

    # The log JSON will contain `old` and `new` state of the model
    log = models.TextField(null=True)
    # Singature will contain an MD5 hash of the log field
    signature = models.CharField(max_length=36, null=True)

    def verify_log(self):
        if self.log is None:
            return True
        return hashlib.md5(self.log).hexdigest() == str(self.signature)


class DedupeJob(models.Model):
    """ Stores information about a celery job
    """

    class Status(object):
        """Status of job"""
        PENDING = 'PENDING'
        STARTED = 'STARTED'
        SUCCESS = 'SUCCESS'
        ERROR = 'ERROR'
        CHOICES = (
            (PENDING, 'Pending'),
            (STARTED, 'Started'),
            (SUCCESS, 'Success'),
            (ERROR, 'Error'),
        )

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    datetime = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=8, choices=Status.CHOICES, default=Status.PENDING)
    celery_task = models.UUIDField(null=True)

    class Meta(object):
        get_latest_by = 'datetime'


class RecordDuplicate(GroutModel):
    """ Store information about a possible duplicate record pair
    Duplicates are found using a time-distance heuristic
    """
    record = models.ForeignKey(DriverRecord, null=True, related_name="record")

    duplicate_record = models.ForeignKey(DriverRecord, null=True,
                                         related_name="duplicate_record")
    score = models.FloatField(default=0)
    resolved = models.BooleanField(default=False)
    job = models.ForeignKey(DedupeJob)


class RecordCostConfig(GroutModel):
    """Store a configuration for calculating costs of incidents.

    This takes the form of a reference to an enum field on a RecordType, along with user-
    configurable mapping of societal costs for each possible value of that enum.
    """
    #: The record type whose records should be cost-aggregated
    # This will likely need to be set automatically by the front-end
    record_type = models.ForeignKey(RecordType)

    #: Key of the schema property to access (Related Content Type, e.g.'accidentDetails')
    # This will also likely need to be set automatically by the front-end, or at least filtered so
    # that users cannot select content types which allow multiple entries
    content_type_key = models.TextField()

    #: Key of the content type property to access (e.g. 'Severity')
    # This will need to be filtered on the front-end to enums.
    property_key = models.TextField()

    #: User-configurable prefix to cost values
    cost_prefix = models.CharField(max_length=6, blank=True, null=True)

    #: User-configurable suffix to cost values
    cost_suffix = models.CharField(max_length=6, blank=True, null=True)

    @property
    def path(self):
        """Gets the field path specified by this object within a schema"""
        return [self.content_type_key, 'properties', self.property_key]

    #: Mappings between enumerations and cost values (e.g. {'Fatal': 1000000,
    #                                                       'Serious injury': 50000, ...})
    # This should be auto-populated by the front-end once a property_key is selected.
    enum_costs = HStoreField()
