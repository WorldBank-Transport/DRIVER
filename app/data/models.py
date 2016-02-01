import uuid

from django.db import models
from django.contrib.auth.models import User
from ashlar.models import Record


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

    record = models.ForeignKey(Record, null=True, on_delete=models.SET_NULL)
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


class CeleryJob(models.Model):
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

    class TaskType(object):
        CHOICES = (
            (DEDUPE, 'DEDUPE'),
        )

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateTimeField(auto_now_add=True, db_index=True)
    task_type = models.CharField(choices=TaskType.CHOICES)
    status = models.CharField(max_length=8, choices=Status.CHOICES, default=Status.PENDING)


class RecordDuplicate(models.Model):
    """ Store information about a possible duplicate record

    """
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    records = models.ManyToManyField(Record)
    resolved = models.BooleanField(default=False)
    celery_job = models.ForeignKey(CeleryJob)
