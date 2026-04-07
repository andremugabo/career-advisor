from django.db import models
from core.models.audit import AbstractAuditEntity

class Application(AbstractAuditEntity):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Shortlisted', 'Shortlisted'),
        ('Rejected', 'Rejected'),
    )
    student = models.ForeignKey('profiles.Student', on_delete=models.CASCADE, related_name='applications')
    internship = models.ForeignKey('internships.Internship', on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"{self.student.full_name} -> {self.internship.role_name}"
