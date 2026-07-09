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
        from datetime import datetime
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.lib.colors import HexColor
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
        except ImportError:
            return Response({"error": "reportlab is not installed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        elements = []
        styles = getSampleStyleSheet()
        
        color_dark_blue = HexColor("#146C94")
        color_med_blue = HexColor("#19A7CE")
        color_light_blue = HexColor("#AFD3E2")
        
        # Styles
        title_style = ParagraphStyle(
            name="ReportTitle",
            parent=styles["Heading1"],
            fontSize=24,
            textColor=color_dark_blue,
            spaceAfter=6,
        )
        subtitle_style = ParagraphStyle(
            name="ReportSubtitle",
            parent=styles["Normal"],
            fontSize=14,
            textColor=colors.gray,
            spaceAfter=20,
        )
        body_style = styles["Normal"]
        
        # Header
        elements.append(Paragraph("<b>Emmerence AI</b> Career Path Advisor", title_style))
        elements.append(Paragraph("Personalized Career Recommendations Report", subtitle_style))
        elements.append(Spacer(1, 10))
        
        # Student Info Card
        student_data = [
            ["Student Name:", student.full_name],
            ["Registration No:", student.reg_number],
            ["Generated On:", datetime.now().strftime("%Y-%m-%d %H:%M")]
        ]
        student_table = Table(student_data, colWidths=[2*inch, 4*inch])
        student_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), color_light_blue),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.white),
        ]))
        elements.append(student_table)
        elements.append(Spacer(1, 30))
        
        elements.append(Paragraph("<b>Your Top Career Matches</b>", ParagraphStyle(name="MatchesTitle", parent=styles["Heading2"], textColor=color_dark_blue, spaceAfter=15)))
        
        # Recommendations Loop
        for idx, rec in enumerate(recommendations):
            title = rec.get('career_name') or rec.get('title', 'Unknown')
            match_pct = f"{rec.get('match_percentage', 0)}%"
            
            # Header row for career
            header_data = [[f"{idx + 1}. {title}", f"Match: {match_pct}"]]
            header_table = Table(header_data, colWidths=[5.5*inch, 1.5*inch])
            header_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), color_med_blue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ]))
            
            missing_skills = ", ".join(rec.get('missing_skills', []))
            details_text = f"<b>Missing Skills:</b> {missing_skills if missing_skills else 'None'}"
            details_para = Paragraph(details_text, body_style)
            details_data = [[details_para]]
            details_table = Table(details_data, colWidths=[7*inch])
            details_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor("#F8FAFC")),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ]))
            
            elements.append(header_table)
            elements.append(details_table)
            elements.append(Spacer(1, 15))
            
        doc.build(elements)
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
