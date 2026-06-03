from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer
from apps.users.views import IsSuperAdmin

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/audit/ - List all audit logs (Admin only)
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperAdmin]

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        """
        GET /api/audit/export-csv/
        Exports all audit logs to a CSV file.
        """
        from django.http import HttpResponse
        import csv

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="audit_logs.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'User', 'Action', 'Details', 'Timestamp', 'IP Address'])

        logs = self.get_queryset()
        for log in logs:
            writer.writerow([
                log.id,
                log.user.email if log.user else 'System',
                log.action,
                log.details,
                log.timestamp,
                log.created_from_ip
            ])

        return response
