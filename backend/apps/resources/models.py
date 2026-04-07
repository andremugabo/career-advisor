from django.db import models
from core.models.audit import AbstractAuditEntity

class Resource(AbstractAuditEntity):
    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255) # or models.FileField
    category = models.CharField(max_length=255)

    def __str__(self):
        return self.title
