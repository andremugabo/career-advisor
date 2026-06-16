from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdvisorMessageViewSet

router = DefaultRouter()
router.register(r'notifications', AdvisorMessageViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]