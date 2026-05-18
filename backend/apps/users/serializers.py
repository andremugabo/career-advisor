from rest_framework import serializers
from apps.users.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active', 'mfa_enabled', 'last_login']
        read_only_fields = ['id', 'email', 'last_login'] # Email and ID shouldn't be mutable here
