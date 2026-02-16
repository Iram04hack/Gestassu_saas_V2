"""
URLs pour le module Commerciaux
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApporteurViewSet, CommissionApporteurViewSet

router = DefaultRouter()
router.register(r'apporteurs', ApporteurViewSet, basename='apporteur')
router.register(r'commissions', CommissionApporteurViewSet, basename='commission')

urlpatterns = [
    path('', include(router.urls)),
]
