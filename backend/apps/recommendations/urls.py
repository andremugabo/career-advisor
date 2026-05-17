from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.recommendations.views import RecommendationViewSet

router = DefaultRouter()
router.register(r'recommendations', RecommendationViewSet, basename='recommendation')

urlpatterns = [
    path('', include(router.urls)),
]
