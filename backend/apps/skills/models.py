from django.db import models
from core.models.audit import AbstractAuditEntity

class Skill(AbstractAuditEntity):
    CATEGORY_CHOICES = (
        ('Technical', 'Technical'),
        ('Soft', 'Soft'),
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.category})"

class StudentSkill(AbstractAuditEntity):
    student = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='student_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='students_with_skill')
    proficiency_level = models.IntegerField(choices=[(i, i) for i in range(1, 6)])

    class Meta:
        unique_together = ('student', 'skill')

class Certification(AbstractAuditEntity):
    name = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    target_cluster = models.ForeignKey('careers.CareerCluster', on_delete=models.SET_NULL, null=True, related_name='certifications')
    skills = models.ManyToManyField(Skill, related_name='certifications', blank=True)

    def __str__(self):
        return self.name

class StudentCertification(AbstractAuditEntity):
    STATUS_CHOICES = (
        ('Planning', 'Planning'),
        ('Completed', 'Completed'),
    )
    student = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='student_certifications')
    cert = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='students_with_cert')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Planning')
    completion_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'cert')
