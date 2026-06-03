from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'sender_email', 'recipient', 'subject', 'message', 'is_read', 'timestamp']
        read_only_fields = ['sender', 'is_read']
