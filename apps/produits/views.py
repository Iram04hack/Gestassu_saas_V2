"""
Views pour le module Produits
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Produit, GroupeProduit
from .serializers import ProduitSerializer, GroupeProduitSerializer


class GroupeProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les groupes de produits
    """
    queryset = GroupeProduit.objects.filter(effacer=False)
    serializer_class = GroupeProduitSerializer
    permission_classes = []  # Accessible à tous les utilisateurs authentifiés par défaut
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['lib_groupe_prod']
    ordering_fields = ['lib_groupe_prod']
    ordering = ['lib_groupe_prod']


class ProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les produits
    """
    queryset = Produit.objects.filter(effacer=False)
    serializer_class = ProduitSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['Id_compagnie', 'code_groupe_prod', 'branche']
    search_fields = ['lib_produit', 'codification_produit']
    ordering_fields = ['lib_produit']
    ordering = ['lib_produit']
