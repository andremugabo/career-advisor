from rest_framework import viewsets, permissions, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Avg
from collections import Counter

from apps.profiles.models import Student
from apps.advisors.models import Advisor, StudentIntervention
from apps.advisors.serializers import AdvisorStudentProfileSerializer, StudentInterventionSerializer
from ai.recommenders.career_recommender import CareerRecommender

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

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        GET /api/advisors/students/analytics/
        Returns global system analytics: total students, average GPA, and system-wide top missing skills.
        """
        students = Student.objects.all()
        total_students = students.count()
        avg_gpa = students.aggregate(avg_gpa=Avg('gpa'))['avg_gpa'] or 0.0
        
        # Calculate system-wide skill gaps
        missing_skills_counter = Counter()
        for student in students:
            recs = CareerRecommender.get_recommendations(student, top_n=3)
            for rec in recs:
                for skill in rec.get('missing_skills', []):
                    missing_skills_counter[skill] += 1
                    
        top_missing = [
            {"name": name, "count": count}
            for name, count in missing_skills_counter.most_common(5)
        ]
        
        return Response({
            "total_students": total_students,
            "average_gpa": round(avg_gpa, 2),
            "top_missing_skills": top_missing
        }, status=status.HTTP_200_OK)


class StudentInterventionViewSet(viewsets.ModelViewSet):
    """
    API for advisors to manage interventions for students.
    """
    permission_classes = [IsAdvisorOrAdmin]
    serializer_class = StudentInterventionSerializer

    def get_queryset(self):
        queryset = StudentIntervention.objects.all().select_related('advisor__user', 'student').order_by('-created_at')
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset

    def perform_create(self, serializer):
        advisor, _ = Advisor.objects.get_or_create(
            user=self.request.user,
            defaults={'specialization': 'General Guidance', 'department': 'Academic Affairs'}
        )
        serializer.save(advisor=advisor)

