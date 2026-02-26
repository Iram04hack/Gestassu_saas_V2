"""
URLs pour le module Contrats
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContratViewSet, RisquesViewSet

router = DefaultRouter()
router.register(r'contrats', ContratViewSet, basename='contrat')
router.register(r'risques', RisquesViewSet, basename='risque')

urlpatterns = [
    path('', include(router.urls)),
]
