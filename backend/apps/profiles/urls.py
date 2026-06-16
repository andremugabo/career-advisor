from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.profiles.views import ProfileViewSet, WorkExperienceViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'profiles/work-experience', WorkExperienceViewSet, basename='work-experience')

urlpatterns = [
    path('', include(router.urls)),
]
