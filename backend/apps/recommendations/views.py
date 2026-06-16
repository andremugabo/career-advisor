import os
import json
import logging
import functools
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.profiles.models import Student
from apps.careers.models import CareerCluster
from apps.skills.models import Certification
from apps.recommendations.models import MatchResult
from apps.recommendations.serializers import MatchResultSerializer, CareerRecommendationSerializer
from ai.recommenders.career_recommender import CareerRecommender

logger = logging.getLogger(__name__)

def handle_exceptions(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        try:
            return func(self, request, *args, **kwargs)
        except Exception as e:
            logger.exception("Unexpected error in %s", func.__name__)
            return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return wrapper

# Load compiled education & experience mappings
MAPPINGS_PATH = os.path.join(settings.BASE_DIR, 'dataset', 'education_experience_mappings.json')
EDUCATION_MAPPINGS = {}
if os.path.exists(MAPPINGS_PATH):
    try:
        with open(MAPPINGS_PATH, 'r', encoding='utf-8') as f:
            EDUCATION_MAPPINGS = json.load(f)
    except Exception:
        pass


def get_education_mapping(onet_code):
    """
    Look up education/experience data for an O*NET code.
    Uses a 3-tier fallback strategy:
      1. Exact match (e.g. '15-2051.00')
      2. Same occupation family (e.g. '15-2051.xx')
      3. Same occupation group (e.g. '13-20xx.xx') — nearest neighbour
    """
    if not onet_code:
        return {}
    # Tier 1: Exact match
    if onet_code in EDUCATION_MAPPINGS:
        return EDUCATION_MAPPINGS[onet_code]
    # Tier 2: Same occupation family prefix (XX-XXXX)
    prefix_7 = onet_code[:7]  # e.g. "15-2051"
    for key, value in EDUCATION_MAPPINGS.items():
        if key.startswith(prefix_7):
            return value
    # Tier 3: Same occupation group prefix (XX-XX) — picks the closest neighbour
    prefix_5 = onet_code[:5]  # e.g. "13-20"
    for key, value in EDUCATION_MAPPINGS.items():
        if key.startswith(prefix_5):
            return value
    return {}


class RecommendationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @handle_exceptions
    def list(self, request):
        """
        GET /api/recommendations/
        Generates and returns the top 5 career recommendations for a student.
        Students get their own recommendations. Advisors/Admins can specify student_id query param.
        """
        user = request.user
        student = None

        # RBAC Check
        if hasattr(user, 'student_profile'):
            student = user.student_profile
        else:
            # If the user is an Advisor or Admin, they can view recommendations for a specific student
            if user.role in ['Advisor', 'Admin']:
                student_id = request.query_params.get('student_id')
                if not student_id:
                    return Response(
                        {"error": "Advisors/Admins must provide a 'student_id' parameter."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    student = Student.objects.get(id=student_id)
                except Student.DoesNotExist:
                    return Response(
                        {"error": "Student not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                # No student profile; return empty list for recommendations
                return Response([], status=status.HTTP_200_OK)

        # Run AI Recommender
        recommendations = CareerRecommender.get_recommendations(student, top_n=5)
        
        # Save matches and map certifications based on skill gaps
        for rec in recommendations:
            # Persistent Audit Logging
            try:
                cluster = CareerCluster.objects.get(id=rec['career_id'])
                MatchResult.objects.update_or_create(
                    student=student,
                    cluster=cluster,
                    defaults={
                        'match_score': rec['match_percentage'],
                        'confidence': rec['match_percentage']
                    }
                )
            except Exception:
                pass

            # Map certifications for skill gaps
            missing = rec.get('missing_skills', [])
            certs = Certification.objects.filter(skills__name__in=missing).distinct()[:3]
            rec['recommended_certs'] = certs

            # Attach Education and Experience suggestions
            onet_code = rec.get('onet_code')
            mapping = get_education_mapping(onet_code)
            rec['required_education'] = mapping.get('required_education', 'Not Specified')
            rec['work_experience'] = mapping.get('work_experience', 'Not Specified')
            rec['on_the_job_training'] = mapping.get('on_the_job_training', 'Not Specified')

        # Let the frontend handle the empty state
        # if not recommendations:
        #     recommendations = []

        serializer = CareerRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='history')
    @handle_exceptions
    def history(self, request):
        """
        GET /api/recommendations/history/
        Returns the persistent audit log history of past career matches for the student.
        """
        user = request.user
        student = None

        if hasattr(user, 'student_profile'):
            student = user.student_profile
        else:
            if user.role in ['Advisor', 'Admin']:
                student_id = request.query_params.get('student_id')
                if not student_id:
                    return Response(
                        {"error": "Advisors/Admins must provide a 'student_id' parameter."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    student = Student.objects.get(id=student_id)
                except Student.DoesNotExist:
                    return Response(
                        {"error": "Student not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                return Response(
                    {"error": "You do not have a student profile associated with this account."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        history_records = MatchResult.objects.filter(student=student).order_by('-timestamp')
        
        from core.pagination import StandardResultsSetPagination
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(history_records, request, view=self)
        if page is not None:
            serializer = MatchResultSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = MatchResultSerializer(history_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='export-pdf')
    @handle_exceptions
    def export_pdf(self, request):
        """
        GET /api/recommendations/export-pdf/
        Generates and returns a PDF report of the student's career recommendations.
        """
        user = request.user
        if hasattr(user, 'student_profile'):
            student = user.student_profile
        else:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        recommendations = CareerRecommender.get_recommendations(student, top_n=5)
        
        from django.http import HttpResponse
        import io
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            from reportlab.lib import colors
        except ImportError:
            return Response({"error": "reportlab is not installed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Enhanced PDF styling with colors
        from reportlab.lib import colors
        p.setFont("Helvetica-Bold", 16)
        p.setFillColor(colors.darkblue)
        p.drawString(100, height - 80, f"Career Recommendations Report")
        p.setFillColor(colors.black)
        p.setFont("Helvetica", 12)
        p.drawString(100, height - 100, f"Student: {student.full_name}")
        p.drawString(100, height - 120, f"Registration Number: {student.reg_number}")
        # Header bar with background color
        p.setFillColor(colors.lightgrey)
        p.rect(95, height - 130, width - 190, 30, fill=1, stroke=0)
        p.setFillColor(colors.darkblue)
        p.setFont("Helvetica-Bold", 12)
        p.drawString(100, height - 120, "Career Recommendations")

        y_pos = height - 160
        for idx, rec in enumerate(recommendations):
            p.setFont("Helvetica-Bold", 14)
            p.drawString(100, y_pos, f"{idx + 1}. {rec.get('career_name') or rec.get('title', 'Unknown')}")
            y_pos -= 20
            p.setFont("Helvetica", 12)
            p.drawString(120, y_pos, f"Match: {rec.get('match_percentage', 0)}%")
            y_pos -= 20
            missing_skills = ", ".join(rec.get('missing_skills', []))
            p.drawString(120, y_pos, f"Missing Skills: {missing_skills if missing_skills else 'None'}")
            y_pos -= 40
            
            if y_pos < 100:
                p.showPage()
                y_pos = height - 80

        p.showPage()
        p.save()
        buffer.seek(0)
        
        # Log export
        ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=user,
            action="exported_recommendation_report",
            details={},
            created_by=user.email,
            created_from_ip=ip_addr,
            modified_from_ip=ip_addr
        )

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="career_report_{student.reg_number}.pdf"'
        return response
