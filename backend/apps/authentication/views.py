from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.authentication.serializers import (
    UserRegistrationSerializer, 
    PasswordUpdateSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny] # Publicly accessible for self-registration

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully! You can now log in.",
                    "email": user.email,
                    "role": user.role
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Restricted strictly to authenticated users

    def post(self, request):
        serializer = PasswordUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {"message": "Password updated successfully!"},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny] # Publicly accessible

    def post(self, request):
        from django.contrib.auth import get_user_model
        from apps.authentication.models import PasswordResetToken
        from apps.authentication.services import send_password_reset_email
        
        User = get_user_model()
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                # Generate a secure 6-digit OTP
                reset_token = PasswordResetToken.generate_token_for_user(user)
                # Trigger OTP email sending
                send_password_reset_email(reset_token)
            except User.DoesNotExist:
                # Silently return success to defend against username/email enumeration security attacks
                pass
                
            return Response(
                {"message": "If an account matches this email, a 6-digit verification code has been sent."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny] # Publicly accessible

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            reset_token = serializer.validated_data['reset_token']
            user = reset_token.user
            
            # Hashing and saving new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Mark reset token as used
            reset_token.is_used = True
            reset_token.save()
            
            return Response(
                {"message": "Password has been reset successfully! You can now log in using your new credentials."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcademicProgramsListView(APIView):
    permission_classes = [permissions.AllowAny] # Publicly accessible for signup page

    def get(self, request):
        from apps.profiles.models import AcademicPrograms
        programs = AcademicPrograms.objects.all().values('id', 'name', 'faculty')
        return Response(list(programs), status=status.HTTP_200_OK)


from rest_framework_simplejwt.tokens import RefreshToken

class MFAVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from apps.authentication.serializers import MFAVerifySerializer
        serializer = MFAVerifySerializer(data=request.data)
        if serializer.is_valid():
            mfa_token = serializer.validated_data['mfa_token']
            user = serializer.validated_data['user']
            
            # Mark token as used
            mfa_token.is_used = True
            mfa_token.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    from apps.authentication.serializers import CustomTokenObtainPairSerializer
    serializer_class = CustomTokenObtainPairSerializer


