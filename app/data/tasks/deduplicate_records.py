from django.conf import settings
from django.core.paginator import Paginator

from celery import shared_task
from celery.utils.log import get_task_logger

from data.models import (DedupeJob, RecordDuplicate)
from ashlar.models import Record

import datetime
from pytz import timezone

logger = get_task_logger(__name__)


def get_time_allowance():
    return datetime.timedelta(days=1)


# .001 degrees is ~110m give or take 10 depending on location, which should
# be good enough
def get_distance_allowance():
    return 0.001


def calculate_score(record, duplicate):
    """
    Set a score representing the likelyhood the two records are duplicated, based
    on the criteria.  score is a float between 0 and 1

    normalized dimensions are considered equal (1 day equally as important as 100m)
    """
    tdelta = abs(record.occurred_from - duplicate.occurred_from)
    tscore = 0
    if tdelta.total_seconds() == 0:
        tscore = 1.0
    else:
        tscore = tdelta.total_seconds() / get_time_allowance().total_seconds()
    ddelta = record.geom.distance(duplicate.geom)
    dscore = 0
    if ddelta == 0.0:
        dscore = 1.0
    else:
        dscore = ddelta / get_distance_allowance()
    score = (tscore + dscore) / 2
    return score


def find_duplicates_for_record(uuid):
    """ Given a record, find all possible duplicates for it
    """
    record = Record.objects.get(uuid=uuid)
    return Record.objects.filter(
        schema__record_type=record.schema.record_type,
        geom__dwithin=(record.geom, get_distance_allowance()),
        occurred_from__range=(
            record.occurred_from - get_time_allowance(), record.occurred_from + get_time_allowance()
        )
    ).exclude(uuid=record.uuid)


def get_time_extent():
    """ Get the time range to dedupe
    Calculate from X hr before the last dedupe run to the current task run's
    start time, where X is the heuristic's time allowance

    Returns:
        dictionary containing the start and end times for the next dedupe task
        {starttime: timestamp, endtime: timestamp}
    """
    # TODO: get config var determining matching time - use value of 1 hr for now
    time_allowance = get_time_allowance()
    last_job = None
    if DedupeJob.objects.all().count() > 0:
        last_job = DedupeJob.objects.latest()
    start_time = None
    if last_job:
        start_time = last_job.datetime - time_allowance
    else:
        start_time = Record.objects.earliest('occurred_from').occurred_from
    end_time = datetime.datetime.utcnow().replace(tzinfo=timezone('UTC'))
    return {'start_time': start_time, 'end_time': end_time}


def get_dedupe_set(extent):
    """ Get the set of records to dedupe
    return a set of uuids to check for duplicates, and the queryset used to
    generate it
    """
    queryset = Record.objects.filter(
        occurred_from__range=(
            extent['start_time'], extent['end_time']
        )
    ).exclude(uuid__in=get_dedupe_ids())
    ids = list(queryset.values_list(queryset.model._meta.pk.name, flat=True))
    return (ids, queryset)


def get_dedupe_ids(job=None):
    """ Get the ids of records to dedupe
    return a set of uuids to check for duplicates.
    """
    queryset = None
    if job:
        queryset = RecordDuplicate.objects.filter(job=job)
    else:
        queryset = RecordDuplicate.objects.all()
    ids = list(queryset.values_list('record', flat=True))
    return ids


@shared_task
def find_duplicate_records():
    """ Find all duplicate records
    Duplicate records are classified as two records that occured at the same time
    and location

    Heuristic:
    Records that have times within 1 day of each other
    Records that are located ~100m from each other
    """
    time_extent = get_time_extent()
    ids, queryset = get_dedupe_set(time_extent)
    # this can be adjusted depending on the memory required
    paginator = Paginator(ids, 1000)
    job = DedupeJob(status=DedupeJob.Status.STARTED)
    job.save()
    starttime = datetime.datetime.now()
    duplicatecount = 0
    try:
        print "Finding duplicates"
        for page_num in paginator.page_range:
            page = paginator.page(page_num)
            records = queryset.in_bulk(page.object_list)
            done = []
            for record in records:
                done.append(record)
                duplicates = find_duplicates_for_record(record)
                recordDuplicates = []
                for duplicate in duplicates:
                    if duplicate.uuid not in done:
                        rec = Record.objects.get(uuid=record)
                        recordDuplicates.append(
                            RecordDuplicate(
                                record=rec,
                                duplicate_record=duplicate,
                                record_type=rec.schema.record_type,
                                job=job,
                                score=calculate_score(rec, duplicate)
                            )
                        )
                        duplicatecount += 1
                RecordDuplicate.objects.bulk_create(recordDuplicates)
            print "Page %d of %d done. %d duplicates found, %s elapsed" % (
                page_num, paginator.num_pages,
                duplicatecount,
                datetime.datetime.now()-starttime)
        print "Finished searching for duplicate records."
        job.status = DedupeJob.Status.SUCCESS
    except Exception as e:
        # TODO: retry job next time it runs with same start time
        job.status = DedupeJob.Status.ERROR
        print "Failed: exception=\n%s" % (e,)
    job.save()
