"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from core.views import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # Health Check
    path("api/health/", health_check, name="health_check"),
    
    # Swagger API Endpoints
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    
    # Global JWT Endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # AI Recommendation Engine Endpoints
    path("api/", include("apps.recommendations.urls")),

    # Profiles Endpoints
    path("api/", include("apps.profiles.urls")),

    # Skills Endpoints
    path("api/", include("apps.skills.urls")),

    # Internships Endpoints
    path("api/", include("apps.internships.urls")),

    # Applications Endpoints
    path("api/", include("apps.applications.urls")),

    # Advisors Endpoints
    path("api/", include("apps.advisors.urls")),

    # Authentication Endpoints
    path("api/", include("apps.authentication.urls")),

    # Admin Management Endpoints
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.audit.urls")),
]

