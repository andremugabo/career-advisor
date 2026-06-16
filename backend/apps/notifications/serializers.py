from rest_framework import serializers
from .models import AdvisorMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class AdvisorMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)

    class Meta:
        model = AdvisorMessage
        fields = [
            'id', 'sender', 'sender_email',
            'recipient', 'recipient_name',
            'subject', 'body',
            'is_read', 'read_at', 'approved',
            'created_at',
        ]
        read_only_fields = ['sender', 'sender_email', 'recipient_name', 'is_read', 'read_at', 'created_at']
