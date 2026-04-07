from django.db import models
from django.conf import settings
from core.models.audit import AbstractAuditEntity

class Advisor(AbstractAuditEntity):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='advisor_profile')
    specialization = models.CharField(max_length=255)
    department = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.email} - {self.specialization}"
