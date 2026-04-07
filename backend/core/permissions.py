from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can do anything
        if request.user and request.user.is_staff:
            return True
        
        # Check if obj has a user/owner attribute and matches
        owner = getattr(obj, 'user', None) or getattr(obj, 'student', None)
        return owner == request.user
