from django.db import models
from core.models.audit import AbstractAuditEntity

class MatchResult(AbstractAuditEntity):
    student = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='matches')
    cluster = models.ForeignKey('careers.CareerCluster', on_delete=models.CASCADE, related_name='matches')
    match_score = models.FloatField()
    confidence = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match: {self.student.full_name} -> {self.cluster.name}"
