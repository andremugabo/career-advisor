from django.db import models
from core.models.audit import AbstractAuditEntity

class Internship(AbstractAuditEntity):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=100, default='Full-time')
    description = models.TextField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    deadline = models.DateField(blank=True, null=True)
    cluster = models.ForeignKey('careers.CareerCluster', on_delete=models.SET_NULL, null=True, related_name='internships')

    def __str__(self):
        return f"{self.title} at {self.company}"
