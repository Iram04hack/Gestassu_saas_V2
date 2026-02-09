"""
Views pour le module Compagnies
APIs REST pour les compagnies et leurs contacts
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Compagnie, ContactCompagnie
from .serializers import CompagnieSerializer, ContactCompagnieSerializer


class CompagnieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les compagnies d'assurance
    Fournit les operations CRUD + recherche et filtrage
    """
    queryset = Compagnie.objects.filter(effacer=False)
    serializer_class = CompagnieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom_compagnie', 'email_compagnie', 'tel_compagnie', 'codification_compagnie']
    ordering_fields = ['date_enreg', 'nom_compagnie']
    ordering = ['nom_compagnie']
    
    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Récupérer tous les contacts d'une compagnie"""
        contacts = ContactCompagnie.objects.filter(
            id_compagnie=pk,
            effacer=False
        )
        serializer = ContactCompagnieSerializer(contacts, many=True)
        return Response(serializer.data)


class ContactCompagnieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les contacts des compagnies
    """
    queryset = ContactCompagnie.objects.filter(effacer=False)
    serializer_class = ContactCompagnieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom_contact', 'email_contact', 'tel_contact', 'fonction_contact']
    ordering_fields = ['date_enreg', 'nom_contact']
    ordering = ['nom_contact']
    
    def get_queryset(self):
        """
        Filtrage par compagnie
        """
        queryset = super().get_queryset()
        
        # Filtre par compagnie
        id_compagnie = self.request.query_params.get('id_compagnie', None)
        if id_compagnie:
            queryset = queryset.filter(id_compagnie=id_compagnie)
            
        return queryset
