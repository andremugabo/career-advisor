from rest_framework import serializers
from apps.audit.models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_email', 'action', 'details', 'timestamp', 'created_from_ip']
        
    def get_user_email(self, obj):
        return obj.user.email if obj.user else "System"
