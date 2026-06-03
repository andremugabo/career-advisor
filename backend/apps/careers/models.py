from django.db import models
from core.models.audit import AbstractAuditEntity

class CareerCluster(AbstractAuditEntity):
    onet_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=dict)

    def __str__(self):
        return self.name

class CareerAssessment(AbstractAuditEntity):
    title = models.CharField(max_length=255)
    description = models.TextField()
    questions = models.JSONField(default=list)

    def __str__(self):
        return self.title

class AssessmentResponse(AbstractAuditEntity):
    student = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='assessment_responses')
    assessment = models.ForeignKey(CareerAssessment, on_delete=models.CASCADE)
    answers = models.JSONField(default=dict)
    score_profile = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.student.full_name} - {self.assessment.title}"

class FavoriteCareer(AbstractAuditEntity):
    student = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='favorite_careers')
    career = models.ForeignKey(CareerCluster, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('student', 'career')
