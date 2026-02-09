"""
Views pour le module CRM
APIs REST pour les clients et interactions
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client, Interaction
from .serializers import ClientSerializer, InteractionSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les clients
    Fournit les operations CRUD + recherche et filtrage
    """
    queryset = Client.objects.filter(effacer=False)  # Ne pas afficher les clients supprimés
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom_client', 'prenom_client', 'email', 'telephone', 'id_client']
    ordering_fields = ['date_enreg', 'nom_client', 'prenom_client']
    ordering = ['-date_enreg']
    
    def get_queryset(self):
        """
        Filtrage personnalisé du queryset
        """
        queryset = super().get_queryset()
        
        # Filtre par type (personne ou entreprise)
        est_entreprise = self.request.query_params.get('est_entreprise', None)
        if est_entreprise is not None:
            queryset = queryset.filter(est_entreprise=(est_entreprise.lower() == 'true'))
        
        # Filtre par source
        source = self.request.query_params.get('source', None)
        if source:
            queryset = queryset.filter(source=source)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques sur les clients"""
        total = self.get_queryset().count()
        entreprises = self.get_queryset().filter(est_entreprise=True).count()
        personnes = self.get_queryset().filter(est_entreprise=False).count()
        
        return Response({
            'total': total,
            'entreprises': entreprises,
            'personnes': personnes
        })


class InteractionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les interactions
    """
    queryset = Interaction.objects.filter(effacer=False)
    serializer_class = InteractionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id_client', 'type_interaction', 'description']
    ordering_fields = ['date_heure_interaction', 'date_enreg']
    ordering = ['-date_heure_interaction']
    
    def get_queryset(self):
        """
        Filtrage par client
        """
        queryset = super().get_queryset()
        
        # Filtre par client
        id_client = self.request.query_params.get('id_client', None)
        if id_client:
            queryset = queryset.filter(id_client=id_client)
            
        return queryset
