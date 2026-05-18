from rest_framework import viewsets, permissions
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer
from apps.users.views import IsSuperAdmin # Reuse the permission we just created

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/audit/ - List all audit logs (Admin only)
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperAdmin]
