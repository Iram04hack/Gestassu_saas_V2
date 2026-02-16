"""
URLs pour le module Produits
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProduitViewSet, GroupeProduitViewSet, CatVehiculeViewSet, 
    CommissionCategorieViewSet, AttestationViewSet
)

router = DefaultRouter()
router.register(r'produits', ProduitViewSet, basename='produit')
router.register(r'groupes', GroupeProduitViewSet, basename='groupe-produit')
router.register(r'categories-vehicules', CatVehiculeViewSet, basename='cat-vehicule')
router.register(r'commissions', CommissionCategorieViewSet, basename='commission-categorie')
router.register(r'attestations', AttestationViewSet, basename='attestation')


urlpatterns = [
    path('', include(router.urls)),
]
