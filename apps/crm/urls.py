"""
Configuration des URLs pour le module CRM
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, InteractionViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'interactions', InteractionViewSet, basename='interaction')

urlpatterns = [
    path('', include(router.urls)),
]
