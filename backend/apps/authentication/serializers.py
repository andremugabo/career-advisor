from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from apps.profiles.models import Student, AcademicPrograms

User = get_user_model()

class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(max_length=255)
    reg_number = serializers.CharField(max_length=50)
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=AcademicPrograms.objects.all(), source='program'
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_reg_number(self, value):
        if Student.objects.filter(reg_number=value).exists():
            raise serializers.ValidationError("A student with this registration number already exists.")
        return value

    def create(self, validated_data):
        program = validated_data.pop('program')
        full_name = validated_data.pop('full_name')
        reg_number = validated_data.pop('reg_number')
        password = validated_data.pop('password')
        email = validated_data['email']

        with transaction.atomic():
            # Create User with a strict Student role for security
            user = User.objects.create_user(
                email=email,
                password=password,
                role='Student'
            )
            
            # Create default Student Profile linking to User
            student = Student.objects.create(
                user=user,
                full_name=full_name,
                reg_number=reg_number,
                program=program,
                gpa=0.0,
                current_year=1,
                bio=""
            )
            
            # Trigger welcome email and verification email
            from apps.authentication.services import send_welcome_email, send_email_verification_email
            from apps.authentication.models import EmailVerificationToken
            
            def on_commit_callback():
                send_welcome_email(student)
                token = EmailVerificationToken.generate_token_for_user(user)
                send_email_verification_email(token)
                
            transaction.on_commit(on_commit_callback)
            
        return user


class PasswordUpdateSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        from apps.authentication.models import PasswordResetToken
        token_code = attrs.get('token')
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token_code, is_used=False)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid or expired reset token."})

        if not reset_token.is_valid():
            reset_token.is_used = True
            reset_token.save()
            raise serializers.ValidationError({"token": "This reset token has expired."})

        attrs['reset_token'] = reset_token
        return attrs


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import exceptions

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        email = attrs.get('email') or attrs.get(User.USERNAME_FIELD)
        
        try:
            data = super().validate(attrs)
        except exceptions.AuthenticationFailed as e:
            # Increment failed attempts if user exists
            try:
                user = User.objects.get(email=email)
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= 5:
                    user.is_active = False  # Lock account
                user.save()
            except User.DoesNotExist:
                pass
            raise e
            
        # Reset failed attempts on successful login
        if self.user:
            self.user.failed_login_attempts = 0
            self.user.save()
            
            if self.user.mfa_enabled:
                from apps.authentication.models import MFAToken
                from apps.authentication.services import send_mfa_email
                
                mfa_token = MFAToken.generate_token_for_user(self.user)
                send_mfa_email(mfa_token)
                
                return {
                    "mfa_required": True,
                    "email": self.user.email
                }
            
        return data


class MFAVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        from django.contrib.auth import get_user_model
        from apps.authentication.models import MFAToken
        User = get_user_model()
        
        email = attrs.get('email')
        token_code = attrs.get('token')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials or verification code.")
            
        try:
            mfa_token = MFAToken.objects.get(user=user, token=token_code, is_used=False)
        except MFAToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired verification code.")
            
        if not mfa_token.is_valid():
            mfa_token.is_used = True
            mfa_token.save()
            raise serializers.ValidationError("This verification code has expired.")
            
        attrs['mfa_token'] = mfa_token
        attrs['user'] = user
        return attrs

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        from django.contrib.auth import get_user_model
        from apps.authentication.models import EmailVerificationToken
        User = get_user_model()
        
        email = attrs.get('email')
        token_code = attrs.get('token')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials or verification code.")
            
        try:
            verification_token = EmailVerificationToken.objects.get(user=user, token=token_code, is_used=False)
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired verification code.")
            
        if not verification_token.is_valid():
            verification_token.is_used = True
            verification_token.save()
            raise serializers.ValidationError("This verification code has expired.")
            
        attrs['verification_token'] = verification_token
        attrs['user'] = user
        return attrs

