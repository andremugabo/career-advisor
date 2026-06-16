from django.db import models
from django.conf import settings
from core.models.audit import AbstractAuditEntity

class AdvisorMessage(AbstractAuditEntity):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_advisor_messages')
    recipient = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='advisor_messages')
    subject = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    approved = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} from {self.sender}"
