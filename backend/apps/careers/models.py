from django.db import models
from core.models.audit import AbstractAuditEntity

class CareerCluster(AbstractAuditEntity):
    onet_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=dict)

    def __str__(self):
        return self.name
