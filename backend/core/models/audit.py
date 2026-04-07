from django.db import models
from .base import AbstractBaseEntity

class AbstractAuditEntity(AbstractBaseEntity):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=255, null=True, blank=True)
    updated_by = models.CharField(max_length=255, null=True, blank=True)
    created_from_ip = models.GenericIPAddressField(null=True, blank=True)
    modified_from_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        abstract = True
