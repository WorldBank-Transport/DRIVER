import uuid as uuidlib

from django.contrib.auth.models import User
from django.db import models
from djsonb import fields as jfields


class SavedFilter(models.Model):
    """A filter saved by the user for later reference"""
    uuid = models.UUIDField(primary_key=True, default=uuidlib.uuid4, editable=False)
    label = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    filter_json = jfields.JsonField()
