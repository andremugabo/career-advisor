from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CareerAssessmentViewSet, FavoriteCareerViewSet,
    CareerClusterViewSet,
    CompareCareersView, CareerPathVisualizationView
)

router = DefaultRouter()
router.register(r'assessments', CareerAssessmentViewSet, basename='assessment')
router.register(r'favorites', FavoriteCareerViewSet, basename='favorite')
router.register(r'clusters', CareerClusterViewSet, basename='cluster')

urlpatterns = [
    path('', include(router.urls)),
    path('compare/', CompareCareersView.as_view(), name='compare_careers'),
    path('visualize-path/', CareerPathVisualizationView.as_view(), name='visualize_path'),
]