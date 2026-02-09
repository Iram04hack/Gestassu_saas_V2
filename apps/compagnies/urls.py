"""
Configuration des URLs pour le module Compagnies
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompagnieViewSet, ContactCompagnieViewSet

router = DefaultRouter()
router.register(r'compagnies', CompagnieViewSet, basename='compagnie')
router.register(r'contacts', ContactCompagnieViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
