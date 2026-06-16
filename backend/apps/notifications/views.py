from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import AdvisorMessage
from .serializers import AdvisorMessageSerializer
from apps.profiles.models import Student


class AdvisorMessageViewSet(viewsets.ModelViewSet):
    """
    Messaging endpoint used by both Advisors and Students.
    - Advisors see all messages they SENT.
    - Students see all messages they RECEIVED.
    - Both sides share the same endpoint so messages are always in sync.
    """
    serializer_class = AdvisorMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # If the user is a student, show messages addressed to their student profile
        if user.role == 'Student':
            try:
                student = Student.objects.get(user=user)
                return AdvisorMessage.objects.filter(recipient=student).order_by('-created_at')
            except Student.DoesNotExist:
                return AdvisorMessage.objects.none()

        # If the user is an Advisor or Admin, show messages they sent
        # Also optionally filter by student_id query param
        queryset = AdvisorMessage.objects.filter(sender=user).order_by('-created_at')
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(recipient_id=student_id)
        return queryset

    def perform_create(self, serializer):
        """Advisor/Admin creates a message to a student."""
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Mark a message as read (typically by the student recipient)."""
        message = self.get_object()
        message.is_read = True
        message.read_at = timezone.now()
        message.save()
        return Response({"status": "Message marked as read."}, status=status.HTTP_200_OK)
