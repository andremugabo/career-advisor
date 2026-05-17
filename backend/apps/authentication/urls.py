from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.authentication.views import UserRegistrationView, PasswordUpdateView

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login_alias'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh_alias'),
    path('auth/password-update/', PasswordUpdateView.as_view(), name='password_update'),
]
