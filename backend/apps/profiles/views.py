from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.profiles.models import Student
from apps.profiles.serializers import StudentProfileSerializer

class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        GET /api/profiles/me/
        Returns the profile of the currently logged-in student.
        """
        user = request.user
        try:
            student = Student.objects.get(user=user)
            serializer = StudentProfileSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found for this user account."},
                status=status.HTTP_404_NOT_FOUND
            )
