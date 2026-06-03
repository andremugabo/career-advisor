from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.profiles.models import Student
from apps.profiles.serializers import StudentProfileSerializer
from apps.audit.models import AuditLog

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
            prev_gpa = student.gpa
            prev_current_year = student.current_year
            prev_full_name = student.full_name
            prev_bio = student.bio

            serializer = StudentProfileSerializer(student, data=request.data, partial=(request.method == 'PATCH' or request.method == 'patch'))
            serializer.is_valid(raise_exception=True)
            serializer.save()

            # Track changes
            changes = {}
            if prev_gpa != student.gpa:
                changes['gpa'] = {'from': prev_gpa, 'to': student.gpa}
            if prev_current_year != student.current_year:
                changes['current_year'] = {'from': prev_current_year, 'to': student.current_year}
            if prev_full_name != student.full_name:
                changes['full_name'] = {'from': prev_full_name, 'to': student.full_name}
            if prev_bio != student.bio:
                changes['bio'] = {'from': prev_bio, 'to': student.bio}

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

            return Response(serializer.data, status=status.HTTP_200_OK)

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

        transcript_file = request.FILES.get('file')
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
        """
        user = request.user
        advisor_id = request.data.get('advisor_id')
        
        if not advisor_id:
            return Response({"error": "advisor_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            student = Student.objects.get(user=user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # In a full implementation, this would create a permission link or a message
        # For now, we simulate sharing by logging it as an audit event.
        ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')
        AuditLog.objects.create(
            user=user,
            action="report_shared_with_advisor",
            details={"advisor_id": advisor_id},
            created_by=user.email,
            created_from_ip=ip_addr,
            modified_from_ip=ip_addr
        )
        
        return Response({"message": "Report successfully shared with the advisor."}, status=status.HTTP_200_OK)
