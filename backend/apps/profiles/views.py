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
