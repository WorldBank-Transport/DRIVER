from django.conf import settings
from django.core.paginator import Paginator
from django.db.models import Q

from celery import shared_task
from celery.app.task import Task
from celery.utils.log import get_task_logger

from data.models import DedupeJob, RecordDuplicate, DriverRecord

import datetime

logger = get_task_logger(__name__)


class DedupeTask(Task):
    """Base class for the deduplication task to handle updating status in database"""

    def on_success(self, retval, task_id, args, kwargs):
        job = DedupeJob.objects.get(celery_task=task_id)
        job.status = DedupeJob.Status.SUCCESS
        job.save()

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """ On failure, delete duplicates found in the unsuccessful run"""
        job = DedupeJob.objects.get(celery_task=task_id)
        job.status = DedupeJob.Status.ERROR
        job.save()
        RecordDuplicate.objects.filter(job=job).delete()


def calculate_similarity_score(record1, record2, time_allowance, distance_allowance):
    """
    Set a score representing the likelyhood the two records are duplicated, based
    on the criteria.  score is a float between 0 and 1

    normalized dimensions are considered equal (1 day equally as important as 100m)

    If the records are more than time_allowance or distance_allowance apart, this will
    return a negative value
    """
    tdelta = abs(record1.occurred_from - record2.occurred_from)
    tscore = 1.0 - (tdelta.total_seconds() / time_allowance.total_seconds())
    ddelta = record1.geom.distance(record2.geom)
    dscore = 1.0 - (ddelta / distance_allowance)
    score = (tscore + dscore) / 2
    return score


def find_duplicates_for_record(uuid, time_allowance, distance_allowance):
    """ Given a record, find all possible duplicates for it
    """
    record = DriverRecord.objects.get(uuid=uuid)
    return DriverRecord.objects.filter(
        schema__record_type=record.schema.record_type,
        geom__dwithin=(record.geom, distance_allowance),
        occurred_from__range=(
            record.occurred_from - time_allowance, record.occurred_from + time_allowance
        )
    ).exclude(
        Q(uuid=record.uuid) | Q(
            uuid__in=RecordDuplicate.objects.filter(
                Q(record__uuid=record.uuid) | Q(
                    duplicate_record__uuid=record.uuid
                )
            )
        )
    )


def get_time_extent(job):
    """ Get the time range to dedupe
    Calculate from X hr before the last dedupe run to the current task run's
    start time, where X is the heuristic's time allowance

    Returns:
        dictionary containing the start and end times for the next dedupe task
        {starttime: timestamp, endtime: timestamp}
    """
    last_job = None
    if DedupeJob.objects.all().count() > 0:
        try:
            last_job = DedupeJob.objects.exclude(uuid=job.uuid).latest()
        except DedupeJob.DoesNotExist:
            pass
    if last_job:
        start_time = last_job.datetime
    else:
        start_time = DriverRecord.objects.earliest('created').created
    end_time = job.datetime
    return {'start_time': start_time, 'end_time': end_time}


def get_dedupe_set(extent):
    """ Get the set of records to dedupe
    return a set of uuids to check for duplicates, and the queryset used to
    generate it
    """
    queryset = DriverRecord.objects.filter(
        created__range=(
            extent['start_time'], extent['end_time']
        )
    ).exclude(uuid__in=get_dedupe_ids())
    ids = queryset.values_list('pk', flat=True)
    return (ids, queryset)


def get_dedupe_ids(job=None):
    """
    Gets the set of RecordDuplicates for the specified job, or all of them if none specified
    """
    queryset = None
    if job:
        queryset = RecordDuplicate.objects.filter(job=job)
    else:
        queryset = RecordDuplicate.objects.all()
    ids = list(queryset.values_list('record', flat=True))
    return ids


@shared_task(base=DedupeTask, bind=True)
def find_duplicate_records(self, time_allowance=None, distance_allowance=None, task_id=None):
    """ Find all duplicate records
    Duplicate records are classified as two records that occured at the same time
    and location

    Heuristic:
    Records that have times within 1 day of each other
    Records that are located ~100m from each other

    Multiple tasks running:
    Each job will only consider records added after the last task started.
    This should allow multiple tasks to run at the same time without identifying
    duplicates more than once.

    Job failure:
    On job failure, the task should be retried after deleting the duplicates
    associated with the task.  This is not automatic at this time.
    A job may fail in a way that the job's failed state is not updated to be ERROR
    if the celery worker itself goes down.  Otherwise, the task status should be
    set properly
    """
    if time_allowance is None:
        time_allowance = datetime.timedelta(hours=settings.DEDUPE_TIME_RANGE_HOURS)
    if distance_allowance is None:
        distance_allowance = settings.DEDUPE_DISTANCE_DEGREES

    job = DedupeJob(status=DedupeJob.Status.STARTED, celery_task=self.request.id)
    job.save()

    time_extent = get_time_extent(job)
    ids, queryset = get_dedupe_set(time_extent)
    # this can be adjusted depending on the memory required
    paginator = Paginator(ids, 1000)

    start_time = datetime.datetime.now()
    duplicate_count = 0
    logger.info(
        "Finding duplicates. 1000 records/batch, {0} batches total".format(
            paginator.num_pages
        )
    )
    for page_num in paginator.page_range:
        page = paginator.page(page_num)
        records = queryset.in_bulk(page.object_list)
        done = []
        for rec_id, record in records.iteritems():
            done.append(rec_id)
            duplicates = find_duplicates_for_record(rec_id, time_allowance, distance_allowance)
            record_duplicates = []
            for duplicate in duplicates:
                if duplicate.uuid not in done:
                    record_duplicates.append(
                        RecordDuplicate(
                            record=record,
                            duplicate_record=duplicate,
                            job=job,
                            score=calculate_similarity_score(
                                record, duplicate, time_allowance, distance_allowance
                            )
                        )
                    )
                    duplicate_count += 1
            RecordDuplicate.objects.bulk_create(record_duplicates)
        logger.info(
            "Batch {0} of {1} done. {2} duplicates found, {3}s elapsed".format(
                page_num, paginator.num_pages, duplicate_count, datetime.datetime.now() - start_time
            )
        )
    logger.info("Finished searching for duplicate records.")
