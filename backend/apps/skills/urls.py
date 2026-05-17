from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.skills.views import SkillViewSet, CertificationViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'certifications', CertificationViewSet, basename='certifications')

urlpatterns = [
    path('', include(router.urls)),
]
