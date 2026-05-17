from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.advisors.views import AdvisorViewSet

router = DefaultRouter()
router.register(r'advisors/students', AdvisorViewSet, basename='advisor-students')

urlpatterns = [
    path('', include(router.urls)),
]
