from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from core.models.audit import AbstractAuditEntity

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, AbstractAuditEntity):
    ROLE_CHOICES = (
        ('Student', 'Student'),
        ('Advisor', 'Advisor'),
        ('Admin', 'Admin'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Student')
    mfa_enabled = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
