from django.db import models
from django.conf import settings
from core.models.audit import AbstractAuditEntity

class AcademicPrograms(AbstractAuditEntity):
    name = models.CharField(max_length=255)
    faculty = models.CharField(max_length=255)
    program_skills = models.ManyToManyField('skills.Skill', related_name='academic_programs', blank=True)

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
    transcript_text = models.TextField(blank=True, null=True)

    # Personal Information (new fields from mockup)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_photo_url = models.URLField(max_length=500, blank=True, null=True)

    # Academic Information (new fields from mockup)
    institution_name = models.CharField(max_length=255, blank=True, null=True)
    expected_graduation = models.DateField(blank=True, null=True)
    courses_completed = models.TextField(blank=True, null=True)

    # Career Interests & Preferences (new fields from mockup)
    career_goals = models.TextField(blank=True, null=True)
    preferred_industries = models.TextField(blank=True, null=True)
    extracurricular_activities = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.full_name


class WorkExperience(AbstractAuditEntity):
    """Tracks a student's professional work history entries."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='work_experiences')
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    duration = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.role} at {self.company}"
