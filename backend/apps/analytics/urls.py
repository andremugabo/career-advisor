from django.urls import path
from .views import PermissionMatrixView, DataEncryptionStatusView, SystemOverviewView

urlpatterns = [
    path('analytics/permission-matrix/', PermissionMatrixView.as_view(), name='permission-matrix'),
    path('analytics/encryption-status/', DataEncryptionStatusView.as_view(), name='encryption-status'),
    path('analytics/overview/', SystemOverviewView.as_view(), name='system-overview'),
]
