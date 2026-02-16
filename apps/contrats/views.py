"""
Views pour le module Contrats
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Contrat
from .models import Contrat
from .serializers import ContratSerializer
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

class ContratViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les contrats
    """
    queryset = Contrat.objects.all()
    serializer_class = ContratSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """
        Filtrage personnalisé du queryset
        """
        print("DEBUG: ContratViewSet.get_queryset called")
        # Base queryset sans filtre effacer pour éviter les erreurs si la colonne manque
        # Select related pour optimiser ou éviter les requêtes N+1
        try:
            queryset = Contrat.objects.all().select_related('produit', 'compagnie')
            print(f"DEBUG: Contrat Queryset Count (Initial): {queryset.count()}")
        except Exception as e:
            print(f"DEBUG: Error building base queryset: {e}")
            queryset = Contrat.objects.all()

        # Filtre par client
        id_client = self.request.query_params.get('ID_Client', None)
        if id_client:
            queryset = queryset.filter(ID_Client=id_client)
        
        # Filtre par compagnie (Optimisé: utilisation directe de la FK)
        id_compagnie = self.request.query_params.get('Id_compagnie', None)
        if id_compagnie:
             # Utilisation de l'attribut _id pour éviter la jointure si possible
            queryset = queryset.filter(compagnie_id=id_compagnie)
        
        # Filtre par agence
        code_agence = self.request.query_params.get('CodeAgence', None)
        if code_agence:
            queryset = queryset.filter(CodeAgence=code_agence)

        # Filtre par apporteur
        code_apporteur = self.request.query_params.get('code_apporteur', None)
        if code_apporteur:
            queryset = queryset.filter(code_apporteur=code_apporteur)
            
        # Recherche textuelle (Police, Client, etc.)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(numPolice__icontains=search) |
                Q(numPolice_assureur__icontains=search) |
                Q(ID_Client__icontains=search)
            )
            
        print(f"DEBUG: Final Queryset Count: {queryset.count()}")
        return queryset
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            print(f"CRITICAL ERROR ContratViewSet.list: {e}")
            import traceback
            traceback.print_exc()
            from rest_framework.response import Response
            from rest_framework import status
            return Response(
                {"error": f"Erreur serveur récupérant les contrats: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
