"""
URLs pour le module Produits
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProduitViewSet, GroupeProduitViewSet

router = DefaultRouter()
router.register(r'produits', ProduitViewSet, basename='produit')
router.register(r'groupes', GroupeProduitViewSet, basename='groupe-produit')

urlpatterns = [
    path('', include(router.urls)),
]
