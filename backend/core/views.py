from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from drf_spectacular.utils import extend_schema

@extend_schema(
    summary="API Health Check",
    description="Returns the current health status and server time, used to verify the API is running.",
    responses={200: {"type": "object", "properties": {"status": {"type": "string"}, "timestamp": {"type": "string"}, "service": {"type": "string"}}}}
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Returns the current health status of the API.
    """
    return Response({
        "status": "healthy",
        "timestamp": timezone.now(),
        "service": "Emmerence Career Advisor API"
    })
