from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.skills.models import Skill, StudentSkill, Certification, StudentCertification
from apps.profiles.models import Student
from apps.skills.serializers import (
    SkillSerializer, StudentSkillSerializer,
    CertificationSerializer, StudentCertificationSerializer
)
from apps.users.views import IsAdminOrReadOnly

class SkillViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = SkillSerializer
    queryset = Skill.objects.all().order_by('-created_at')

    def get_queryset(self):
        queryset = Skill.objects.all().order_by('-created_at')
        search_query = self.request.query_params.get('search', None) or self.request.GET.get('search', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        return queryset

    def get_permissions(self):
        if self.action in ['my_skills', 'add_my_skill', 'delete_my_skill']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='my')
    def my_skills(self, request):
        """
        GET /api/skills/my/
        List all skills for the currently logged-in student.
        """
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        student_skills = StudentSkill.objects.filter(student=student).select_related('skill')
        serializer = StudentSkillSerializer(student_skills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @my_skills.mapping.post
    def add_my_skill(self, request):
        """
        POST /api/skills/my/
        Add a skill or update its proficiency for the currently logged-in student.
        """
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentSkillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        skill = serializer.validated_data['skill']
        proficiency_level = serializer.validated_data['proficiency_level']

        student_skill, created = StudentSkill.objects.update_or_create(
            student=student,
            skill=skill,
            defaults={'proficiency_level': proficiency_level}
        )

        return Response(
            StudentSkillSerializer(student_skill).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @action(detail=True, methods=['delete'], url_path='my-delete')
    def delete_my_skill(self, request, pk=None):
        """
        DELETE /api/skills/<skill_id>/my-delete/
        Remove a skill from the student's profile.
        """
        try:
            student = Student.objects.get(user=request.user)
            student_skill = StudentSkill.objects.get(student=student, skill_id=pk)
            student_skill.delete()
            return Response({"message": "Skill removed successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        except StudentSkill.DoesNotExist:
            return Response({"error": "Skill not associated with this student profile."}, status=status.HTTP_404_NOT_FOUND)


class CertificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = CertificationSerializer
    queryset = Certification.objects.all().order_by('-created_at')

    def get_permissions(self):
        if self.action in ['my_certifications', 'enroll_my_certification', 'update_my_certification']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='my')
    def my_certifications(self, request):
        """
        GET /api/certifications/my/
        Returns current student's certifications.
        """
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        student_certs = StudentCertification.objects.filter(student=student).select_related('cert')
        serializer = StudentCertificationSerializer(student_certs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @my_certifications.mapping.post
    def enroll_my_certification(self, request):
        """
        POST /api/certifications/my/
        Enrolls or adds certification to student's path.
        """
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentCertificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cert = serializer.validated_data['cert']
        status_val = serializer.validated_data.get('status', 'Planning')
        completion_date = serializer.validated_data.get('completion_date', None)

        student_cert, created = StudentCertification.objects.update_or_create(
            student=student,
            cert=cert,
            defaults={
                'status': status_val,
                'completion_date': completion_date
            }
        )

        return Response(
            StudentCertificationSerializer(student_cert).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'], url_path='my-update')
    def update_my_certification(self, request, pk=None):
        """
        PATCH /api/certifications/<cert_id>/my-update/
        Update status or completion date of current student's certification.
        """
        try:
            student = Student.objects.get(user=request.user)
            student_cert = StudentCertification.objects.get(student=student, cert_id=pk)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        except StudentCertification.DoesNotExist:
            return Response({"error": "Certification not found in student's planner."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentCertificationSerializer(student_cert, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)
