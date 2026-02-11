"""
Views pour le module Contrats
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Contrat
from .serializers import ContratSerializer


class ContratViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les contrats
    """
    queryset = Contrat.objects.all()
    serializer_class = ContratSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ID_Client', 'compagnie', 'CodeAgence', 'estprojet', 'est_resilier', 'est_suspendu', 'produit__code_groupe_prod']
    search_fields = ['numPolice', 'numPolice_assureur', 'produit__lib_produit']
    ordering_fields = ['date_effet', 'Date_echeance', 'date_enreg', 'prime_totale']
    ordering = ['-date_enreg']
    
    def get_queryset(self):
        """
        Filtrage personnalisé du queryset
        """
        # Base queryset avec soft delete (effacer=False OU effacer=NULL)
        # NOTE: Temporairement sans select_related pour déboguer
        queryset = Contrat.objects.filter(
            Q(effacer=False) | Q(effacer__isnull=True)
        )
        
        # Filtre par client
        id_client = self.request.query_params.get('ID_Client', None)
        if id_client:
            queryset = queryset.filter(ID_Client=id_client)
        
        # Filtre par compagnie
        id_compagnie = self.request.query_params.get('Id_compagnie', None) # Garder Id_compagnie pour compatibilité ou FK
        if id_compagnie:
            queryset = queryset.filter(compagnie__id_compagnie=id_compagnie)
        
        # Filtre par agence
        code_agence = self.request.query_params.get('CodeAgence', None)
        if code_agence:
            queryset = queryset.filter(CodeAgence=code_agence)
        
        return queryset
