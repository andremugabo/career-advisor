from django.db import models
from core.models.audit import AbstractAuditEntity

class Internship(AbstractAuditEntity):
    company_name = models.CharField(max_length=255)
    role_name = models.CharField(max_length=255)
    requirements = models.TextField()
    deadline = models.DateField()
    cluster = models.ForeignKey('careers.CareerCluster', on_delete=models.SET_NULL, null=True, related_name='internships')

    def __str__(self):
        return f"{self.role_name} at {self.company_name}"
