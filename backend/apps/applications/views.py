from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from django.db.models import Q
from apps.applications.models import Application
from apps.profiles.models import Student
from apps.applications.serializers import ApplicationSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer
    queryset = Application.objects.all().order_by('-created_at')

    def get_queryset(self):
        user = self.request.user
        
        # Base Queryset
        if user.role == 'Admin':
            qs = Application.objects.all().select_related('internship', 'internship__cluster', 'student', 'student__user')
        else:
            try:
                student = Student.objects.get(user=user)
                qs = Application.objects.filter(student=student).select_related('internship', 'internship__cluster')
            except Student.DoesNotExist:
                return Application.objects.none()

        # Apply Filters
        search = self.request.query_params.get('search', None)
        status_filter = self.request.query_params.get('status', None)
        month_filter = self.request.query_params.get('month', None)

        if search:
            qs = qs.filter(
                Q(student__full_name__icontains=search) |
                Q(internship__title__icontains=search) |
                Q(internship__company__icontains=search)
            )
        if status_filter:
            qs = qs.filter(status=status_filter)
        if month_filter:
            try:
                year, month = month_filter.split('-')
                qs = qs.filter(created_at__year=year, created_at__month=month)
            except ValueError:
                pass
            
        return qs.order_by('-created_at')

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

    @action(detail=False, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request):
        user = request.user
        if user.role != 'Admin':
            return Response({"error": "Only admins can export reports."}, status=status.HTTP_403_FORBIDDEN)
            
        # Re-use the filtered queryset
        applications = self.get_queryset()
        
        from django.http import HttpResponse
        import io
        from datetime import datetime
        import os
        try:
            from reportlab.lib.pagesizes import letter, landscape
            from reportlab.lib import colors
            from reportlab.lib.colors import HexColor
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
        except ImportError:
            return Response({"error": "reportlab is not installed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        buffer = io.BytesIO()
        # Use landscape for wide table
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=40, bottomMargin=40)
        elements = []
        styles = getSampleStyleSheet()
        
        color_dark_blue = HexColor("#146C94")
        color_med_blue = HexColor("#19A7CE")
        
        # Header
        title_style = ParagraphStyle(
            name="ReportTitle",
            parent=styles["Heading1"],
            fontSize=22,
            textColor=color_dark_blue,
            spaceAfter=6,
        )
        subtitle_style = ParagraphStyle(
            name="ReportSubtitle",
            parent=styles["Normal"],
            fontSize=12,
            textColor=colors.gray,
            spaceAfter=20,
        )
        from django.conf import settings
        
        logo_path = str(settings.BASE_DIR.parent / "frontend" / "public" / "logo.png")
        
        title_p = Paragraph("<b>Emmerence AI</b> Administrator Panel", title_style)
        subtitle_p = Paragraph(f"Student Applications Report | Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", subtitle_style)
        
        if os.path.exists(logo_path):
            logo = Image(logo_path, width=1.5*inch, height=1.5*inch, kind='proportional')
            header_table = Table([[logo, [title_p, subtitle_p]]], colWidths=[1.6*inch, 7*inch])
            header_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (0,0), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('ALIGN', (1,0), (1,0), 'LEFT'),
            ]))
            elements.append(header_table)
        else:
            elements.append(title_p)
            elements.append(subtitle_p)
            
        elements.append(Spacer(1, 20))
        
        # Table Data
        data = [["Student Name", "Internship Title", "Company", "Date Applied", "Status"]]
        
        for app in applications:
            date_str = app.created_at.strftime('%b %d, %Y') if app.created_at else 'N/A'
            student_name = app.student.full_name if app.student else 'Unknown'
            title = app.internship.title if app.internship else 'Unknown'
            company = app.internship.company if app.internship else 'Unknown'
            
            data.append([
                student_name,
                title,
                company,
                date_str,
                app.status
            ])
            
        # Table Style
        table = Table(data, colWidths=[2*inch, 3.5*inch, 2*inch, 1.5*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), color_med_blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor("#F8FAFC")),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor("#F8FAFC"), HexColor("#FFFFFF")]),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
        ]))
        
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="admin_applications_report.pdf"'
        return response
