from rest_framework import viewsets, permissions, status, mixins
from rest_framework.response import Response
from apps.profiles.models import Student
from apps.advisors.serializers import AdvisorStudentProfileSerializer

class IsAdvisorOrAdmin(permissions.BasePermission):
    """
    Allows access only to authenticated users with an Advisor or Admin role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['Advisor', 'Admin']

class AdvisorViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    GET /api/advisors/students/
    Retrieve a detailed, paginated list of all student profiles under advisory guidance.
    """
    permission_classes = [IsAdvisorOrAdmin]
    serializer_class = AdvisorStudentProfileSerializer
    queryset = Student.objects.all().select_related('program').prefetch_related('student_skills__skill').order_by('-created_at')
