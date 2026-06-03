from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.authentication.views import (
    UserRegistrationView, PasswordUpdateView,
    ForgotPasswordView, ResetPasswordView, AcademicProgramsListView,
    CustomTokenObtainPairView, MFAVerifyView, VerifyEmailView
)

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login_alias'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh_alias'),
    path('auth/password-update/', PasswordUpdateView.as_view(), name='password_update'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('auth/programs/', AcademicProgramsListView.as_view(), name='programs_list'),
    path('auth/mfa-verify/', MFAVerifyView.as_view(), name='mfa_verify'),
]

