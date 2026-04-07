from django.db import models
from core.models.audit import AbstractAuditEntity

class CareerCluster(AbstractAuditEntity):
    name = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=dict)

    def __str__(self):
        return self.name
