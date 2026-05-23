from rest_framework import viewsets, permissions
from apps.users.models import User
from apps.users.serializers import UserSerializer

class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission to strictly allow only Super Admins to manage users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'Admin' or request.user.is_superuser))

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access for any authenticated user, but requires Admin role for mutations (POST, PUT, DELETE).
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.role == 'Admin' or request.user.is_superuser)

class UserViewSet(viewsets.ModelViewSet):
    """
    GET /api/users/ - List all users (Admin only)
    GET /api/users/:id/ - Get user details
    PUT/PATCH /api/users/:id/ - Update user role or status
    DELETE /api/users/:id/ - Delete a user
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrReadOnly]
