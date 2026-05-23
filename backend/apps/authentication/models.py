import uuid
import secrets
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class PasswordResetToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # Tokens are valid for exactly 15 minutes
        expiration_time = self.created_at + timedelta(minutes=15)
        return not self.is_used and timezone.now() <= expiration_time

    @classmethod
    def generate_token_for_user(cls, user):
        # Invalidate any previously active unused tokens to maintain single-token security
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate a secure 6-digit OTP code
        otp = "".join(secrets.choice("0123456789") for _ in range(6))
        
        # Prevent collisions
        while cls.objects.filter(token=otp, is_used=False).exists():
            otp = "".join(secrets.choice("0123456789") for _ in range(6))
            
        return cls.objects.create(user=user, token=otp)


class MFAToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mfa_tokens')
    token = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # MFA Tokens are valid for exactly 5 minutes for tighter security
        expiration_time = self.created_at + timedelta(minutes=5)
        return not self.is_used and timezone.now() <= expiration_time

    @classmethod
    def generate_token_for_user(cls, user):
        # Invalidate any previously active unused tokens to maintain single-token security
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate a secure 6-digit OTP code
        otp = "".join(secrets.choice("0123456789") for _ in range(6))
        
        # Prevent collisions
        while cls.objects.filter(token=otp, is_used=False).exists():
            otp = "".join(secrets.choice("0123456789") for _ in range(6))
            
        return cls.objects.create(user=user, token=otp)

