"""
URLs pour le module Contrats
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContratViewSet

router = DefaultRouter()
router.register(r'contrats', ContratViewSet, basename='contrat')

urlpatterns = [
    path('', include(router.urls)),
]
