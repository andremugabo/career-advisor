from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from apps.applications.models import Application
from apps.profiles.models import Student
from apps.applications.serializers import ApplicationSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer
    queryset = Application.objects.all()

    def get_queryset(self):
        # Enforce that students only see their own applications
        try:
            student = Student.objects.get(user=self.request.user)
            return Application.objects.filter(student=student).select_related('internship', 'internship__cluster')
        except Student.DoesNotExist:
            return Application.objects.none()

    def perform_create(self, serializer):
        try:
            student = Student.objects.get(user=self.request.user)
        except Student.DoesNotExist:
            raise ValidationError({"error": "Student profile not found. Complete your profile before applying."})

        internship = serializer.validated_data['internship']
        
        # Enforce uniqueness: A student can only apply once to each internship position
        if Application.objects.filter(student=student, internship=internship).exists():
            raise ValidationError({"error": "You have already applied for this internship."})
            
        serializer.save(student=student)
