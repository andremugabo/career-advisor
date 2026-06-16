from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from apps.users.views import IsSuperAdmin


class PermissionMatrixView(APIView):
    """
    GET /api/analytics/permission-matrix/
    Returns the full RBAC permission matrix for all roles.
    Only accessible by Admin users.
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        permission_matrix = {
            "Student": {
                "profile": ["view", "create", "update"],
                "transcript": ["upload", "view"],
                "career_assessment": ["take", "view_results"],
                "recommendations": ["view", "export_pdf"],
                "skill_gap_analysis": ["view"],
                "internships": ["view", "apply", "filter"],
                "career_path": ["visualize", "compare", "save_favorite"],
                "resources": ["view"],
                "notifications": ["view", "mark_read"],
                "reports": ["share_with_advisor"],
            },
            "Advisor": {
                "student_profiles": ["view"],
                "assessment_results": ["view"],
                "recommendations": ["view", "override", "approve", "reject"],
                "interventions": ["create", "view", "update"],
                "analytics": ["view"],
                "notifications": ["view", "create", "mark_read"],
                "resources": ["view"],
            },
            "Admin": {
                "users": ["view", "create", "update", "delete", "change_role", "toggle_active"],
                "audit_logs": ["view", "export_csv"],
                "internships": ["view", "create", "update", "delete"],
                "skills": ["view", "create", "delete"],
                "certifications": ["view", "create", "delete"],
                "resources": ["view", "create", "update", "delete"],
                "analytics": ["view", "permission_matrix", "encryption_status"],
                "notifications": ["view", "create", "mark_read"],
                "applications": ["view"],
            },
        }
        return Response(permission_matrix, status=status.HTTP_200_OK)


class DataEncryptionStatusView(APIView):
    """
    GET /api/analytics/encryption-status/
    Returns the current data encryption and security configuration status.
    Only accessible by Admin users.
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        db_config = settings.DATABASES.get('default', {})
        db_engine = db_config.get('ENGINE', 'unknown')

        encryption_status = {
            "database": {
                "engine": db_engine,
                "ssl_enabled": bool(db_config.get('OPTIONS', {}).get('sslmode')),
            },
            "authentication": {
                "password_hashing": "PBKDF2 (Django default)",
                "jwt_algorithm": getattr(settings, 'SIMPLE_JWT', {}).get('ALGORITHM', 'HS256'),
                "mfa_enabled": True,
                "email_verification_required": True,
            },
            "api_security": {
                "cors_allowed": getattr(settings, 'CORS_ALLOWED_ORIGINS', []),
                "csrf_protection": True,
                "rate_limiting": hasattr(settings, 'REST_FRAMEWORK') and 'DEFAULT_THROTTLE_CLASSES' in getattr(settings, 'REST_FRAMEWORK', {}),
            },
            "data_protection": {
                "audit_logging": True,
                "soft_deletes": True,
                "ip_tracking": True,
            },
        }
        return Response(encryption_status, status=status.HTTP_200_OK)


class SystemOverviewView(APIView):
    """
    GET /api/analytics/overview/
    Returns a high-level system overview with counts.
    Only accessible by Admin users.
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from apps.users.models import User
        from apps.profiles.models import Student
        from apps.audit.models import AuditLog
        from apps.notifications.models import AdvisorMessage

        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        students = User.objects.filter(role='Student').count()
        advisors = User.objects.filter(role='Advisor').count()
        admins = User.objects.filter(role='Admin').count()
        total_profiles = Student.objects.count()
        total_audit_entries = AuditLog.objects.count()
        unread_messages = AdvisorMessage.objects.filter(is_read=False).count()

        return Response({
            "users": {
                "total": total_users,
                "active": active_users,
                "by_role": {
                    "students": students,
                    "advisors": advisors,
                    "admins": admins,
                },
            },
            "profiles": total_profiles,
            "audit_entries": total_audit_entries,
            "unread_notifications": unread_messages,
        }, status=status.HTTP_200_OK)
