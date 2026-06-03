from rest_framework import viewsets, permissions
from .models import Resource
from .serializers import ResourceSerializer

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Only Advisors and Admins can create/update/delete resources
            class IsAdvisorOrAdmin(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.is_authenticated and request.user.role in ['Advisor', 'Admin']
            permission_classes = [IsAdvisorOrAdmin]
        return [permission() for permission in permission_classes]
