"""
URLs pour le module Tarifs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TarifAutoViewSet, TarifMRHViewSet

router = DefaultRouter()
router.register(r'auto', TarifAutoViewSet, basename='tarif-auto')
router.register(r'mrh', TarifMRHViewSet, basename='tarif-mrh')

urlpatterns = [
    path('', include(router.urls)),
]
