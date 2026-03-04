"""
URLs pour le module Finances
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MouvementViewSet, TypeMouvementViewSet, CaisseViewSet, QuittanceViewSet

router = DefaultRouter()
router.register(r'mouvements', MouvementViewSet, basename='mouvement')
router.register(r'types-mouvements', TypeMouvementViewSet, basename='type-mouvement')
router.register(r'caisses', CaisseViewSet, basename='caisse')
router.register(r'quittances', QuittanceViewSet, basename='quittance')

urlpatterns = [
    path('', include(router.urls)),
]
