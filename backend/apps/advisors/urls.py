from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.advisors.views import AdvisorViewSet, StudentInterventionViewSet

router = DefaultRouter()
router.register(r'advisors/students', AdvisorViewSet, basename='advisor-students')
router.register(r'advisors/interventions', StudentInterventionViewSet, basename='advisor-interventions')

urlpatterns = [
    path('', include(router.urls)),
]
