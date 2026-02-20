"""
Views pour le module Tarifs
"""
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from .models import TarifAuto, TarifMRH
from .serializers import TarifAutoSerializer, TarifMRHSerializer


class TarifPagination(PageNumberPagination):
    """Pagination optimisée pour les tarifs"""
    page_size = 50  # 50 résultats par page par défaut
    page_size_query_param = 'page_size'
    max_page_size = 200  # Maximum 200 résultats par page


class TarifAutoViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tarifs automobile
    Optimisé avec pagination et cache
    """
    serializer_class = TarifAutoSerializer
    pagination_class = TarifPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        """Optimise les requêtes en limitant les champs"""
        return TarifAuto.objects.filter(effacer=False).only(
            'idtarif', 'id_compagnie', 'id_produit', 'groupe', 'code_cat',
            'energie', 'id_garantie', 'puissance_fiscale', 'valeur_vehicule',
            'prime_fixe', 'prime_taux', 'prime_minimun', 'capital',
            'franchise_fixe', 'taux_franchise', 'franchise_min', 'franchise_max'
        )

    # Filtres
    filterset_fields = [
        'id_compagnie',
        'id_produit',
        'code_cat',
        'groupe',
        'energie',
        'id_garantie'
    ]

    # Recherche
    search_fields = [
        'idtarif',
        'groupe',
        'code_cat'
    ]

    # Tri
    ordering_fields = ['id_compagnie', 'groupe', 'code_cat', 'puissance_fiscale']
    ordering = ['id_compagnie', 'groupe', 'code_cat']

    def list(self, request, *args, **kwargs):
        """Override list to catch and log errors properly"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_destroy(self, instance):
        """Soft delete"""
        instance.effacer = True
        instance.save()


class TarifMRHViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tarifs Multirisque Habitation
    Optimisé avec pagination et cache
    """
    serializer_class = TarifMRHSerializer
    pagination_class = TarifPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    lookup_field = 'idtarif_mrh'

    def get_queryset(self):
        """Retourne tous les tarifs MRH non supprimés"""
        return TarifMRH.objects.filter(effacer=False)

    # Filtres
    filterset_fields = [
        'idcompagnie',
        'id_produit',
        'id_garantie'
    ]

    # Recherche
    search_fields = [
        'idtarif_mrh',
        'id_garantie'
    ]

    # Tri
    ordering_fields = ['idcompagnie', 'id_produit', 'id_garantie']
    ordering = ['idcompagnie', 'id_produit']

    def list(self, request, *args, **kwargs):
        """Override list to catch and log errors properly"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_destroy(self, instance):
        """Soft delete"""
        instance.effacer = True
        instance.save()
