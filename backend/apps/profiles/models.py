from django.db import models
from django.conf import settings
from core.models.audit import AbstractAuditEntity

class AcademicPrograms(AbstractAuditEntity):
    name = models.CharField(max_length=255)
    faculty = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Student(AbstractAuditEntity):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    reg_number = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    gpa = models.FloatField()
    program = models.ForeignKey(AcademicPrograms, on_delete=models.SET_NULL, null=True, related_name='students')
    current_year = models.IntegerField()
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.full_name
