from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.profiles.models import Student, WorkExperience
from apps.profiles.serializers import StudentProfileSerializer, WorkExperienceSerializer
from apps.audit.models import AuditLog
from apps.advisors.models import StudentIntervention


class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        """
        GET /api/profiles/me/
        Returns the profile of the currently logged-in student.
        
        PUT/PATCH /api/profiles/me/
        Updates the profile of the currently logged-in student and records audit log.
        """
        user = request.user
        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found for this user account."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.method == 'GET':
            serializer = StudentProfileSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method in ['PUT', 'PATCH', 'patch']:
            # Snapshot all auditable fields before update
            auditable_fields = [
                'full_name', 'gpa', 'current_year', 'bio',
                'phone_number', 'date_of_birth', 'profile_photo_url',
                'institution_name', 'expected_graduation', 'courses_completed',
                'career_goals', 'preferred_industries', 'extracurricular_activities',
            ]
            prev_values = {field: getattr(student, field) for field in auditable_fields}

            serializer = StudentProfileSerializer(
                student, data=request.data,
                partial=(request.method == 'PATCH' or request.method == 'patch')
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

            # Track changes across all auditable fields
            changes = {}
            for field in auditable_fields:
                new_val = getattr(student, field)
                old_val = prev_values[field]
                if str(old_val) != str(new_val):
                    changes[field] = {'from': str(old_val), 'to': str(new_val)}

            if changes:
                ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')
                AuditLog.objects.create(
                    user=user,
                    action="profile_update",
                    details=changes,
                    created_by=user.email,
                    created_from_ip=ip_addr,
                    modified_from_ip=ip_addr
                )

            # Re-serialize from fresh DB state to ensure computed fields are up-to-date
            student.refresh_from_db()
            fresh_serializer = StudentProfileSerializer(student)
            return Response(fresh_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='upload-transcript')
    def upload_transcript(self, request):
        """
        POST /api/profiles/upload-transcript/
        Expects a multipart/form-data upload with 'file' key containing a PDF transcript.
        """
        user = request.user
        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        transcript_file = request.FILES.get('transcript')
        if not transcript_file:
            return Response({"error": "No file uploaded. Please provide a PDF file."}, status=status.HTTP_400_BAD_REQUEST)

        if not transcript_file.name.endswith('.pdf'):
            return Response({"error": "Only PDF files are supported."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(transcript_file)
            extracted_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
            
            student.transcript_text = extracted_text
            student.save()
            
            ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')
            AuditLog.objects.create(
                user=user,
                action="transcript_uploaded",
                details={"filename": transcript_file.name, "size": transcript_file.size},
                created_by=user.email,
                created_from_ip=ip_addr,
                modified_from_ip=ip_addr
            )

            return Response({
                "message": "Transcript uploaded and parsed successfully.",
                "parsed_length": len(extracted_text)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": f"Failed to parse PDF: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='share-report')
    def share_report(self, request):
        """
        POST /api/profiles/share-report/
        Shares the student's career report with an advisor.
        Creates an intervention record visible to both student and advisor.
        """
        user = request.user
        advisor_id = request.data.get('advisor_id')
        
        if not advisor_id:
            return Response({"error": "advisor_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        # Find the advisor user and their advisor profile
        from apps.users.models import User
        from apps.advisors.models import Advisor
        try:
            advisor_user = User.objects.get(id=advisor_id, role='Advisor')
        except User.DoesNotExist:
            return Response({"error": "Advisor not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get or create advisor profile
        advisor, _ = Advisor.objects.get_or_create(
            user=advisor_user,
            defaults={'specialization': 'General Guidance', 'department': 'Academic Affairs'}
        )

        # Create an intervention record (visible to both sides)
        StudentIntervention.objects.create(
            student=student,
            advisor=advisor,
            intervention_type='Career Counseling',
            notes=f"Student {user.email} shared their AI career recommendations report for review.",
        )

        # Audit log
        ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')
        AuditLog.objects.create(
            user=user,
            action="report_shared_with_advisor",
            details={"advisor_id": str(advisor_id), "advisor_email": advisor_user.email},
            created_by=user.email,
            created_from_ip=ip_addr,
            modified_from_ip=ip_addr
        )
        
        return Response({"message": f"Report successfully shared with {advisor_user.email}."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-interventions')
    def my_interventions(self, request):
        """
        GET /api/profiles/my-interventions/
        Returns all advisor interventions for the currently logged-in student.
        """
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        interventions = StudentIntervention.objects.filter(
            student=student
        ).select_related('advisor__user').order_by('-created_at')
        
        data = [
            {
                "id": str(i.id),
                "intervention_type": i.intervention_type,
                "notes": i.notes,
                "advisor_email": i.advisor.user.email if i.advisor and i.advisor.user else "Advisor",
                "created_at": i.created_at.isoformat(),
            }
            for i in interventions
        ]
        
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='list-advisors')
    def list_advisors(self, request):
        """
        GET /api/profiles/list-advisors/
        Returns a simple list of advisors (id + email) for sharing reports.
        """
        from apps.users.models import User
        advisors = User.objects.filter(role='Advisor').values('id', 'email')
        return Response(list(advisors), status=status.HTTP_200_OK)


class WorkExperienceViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for student work experience entries.
    GET    /api/profiles/work-experience/          — List all entries for the logged-in student
    POST   /api/profiles/work-experience/          — Create a new entry
    PATCH  /api/profiles/work-experience/<id>/      — Update an entry
    DELETE /api/profiles/work-experience/<id>/      — Delete an entry
    """
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            student = Student.objects.get(user=self.request.user)
            return WorkExperience.objects.filter(student=student).order_by('-created_at')
        except Student.DoesNotExist:
            return WorkExperience.objects.none()

    def perform_create(self, serializer):
        try:
            student = Student.objects.get(user=self.request.user)
        except Student.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Student profile not found.")

        ip_addr = self.request.META.get('REMOTE_ADDR', '127.0.0.1')
        serializer.save(student=student)

        AuditLog.objects.create(
            user=self.request.user,
            action="work_experience_added",
            details={
                "company": serializer.validated_data.get('company', ''),
                "role": serializer.validated_data.get('role', ''),
            },
            created_by=self.request.user.email,
            created_from_ip=ip_addr,
            modified_from_ip=ip_addr
        )

    def perform_destroy(self, instance):
        ip_addr = self.request.META.get('REMOTE_ADDR', '127.0.0.1')
        AuditLog.objects.create(
            user=self.request.user,
            action="work_experience_removed",
            details={"company": instance.company, "role": instance.role},
            created_by=self.request.user.email,
            created_from_ip=ip_addr,
            modified_from_ip=ip_addr
        )
        instance.delete()
