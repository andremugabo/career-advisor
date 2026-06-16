from django.db import models
from django.conf import settings
from core.models.audit import AbstractAuditEntity

class Advisor(AbstractAuditEntity):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='advisor_profile')
    specialization = models.CharField(max_length=255)
    department = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.email} - {self.specialization}"


class StudentIntervention(AbstractAuditEntity):
    INTERVENTION_TYPES = (
        ('Skill Bridging', 'Skill Bridging'),
        ('GPA Improvement', 'GPA Improvement'),
        ('Career Counseling', 'Career Counseling'),
        ('Academic Guidance', 'Academic Guidance'),
        ('Academic Counseling', 'Academic Counseling'),
        ('Skills Training Recommended', 'Skills Training Recommended'),
        ('Career Track Updated', 'Career Track Updated'),
        ('Email Warning Sent', 'Email Warning Sent'),
    )

    advisor = models.ForeignKey(Advisor, on_delete=models.CASCADE, related_name='interventions')
    student = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='interventions')
    intervention_type = models.CharField(max_length=50, choices=INTERVENTION_TYPES, default='Academic Guidance')
    notes = models.TextField()

    def __str__(self):
        return f"Intervention for {self.student.full_name} by {self.advisor.user.email}"

