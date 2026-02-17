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
    # queryset = Compagnie.objects.filter(effacer=False)
    serializer_class = CompagnieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom_compagnie', 'email_compagnie', 'tel_compagnie', 'codification_compagnie']
    ordering_fields = ['date_enreg', 'nom_compagnie']
    ordering = ['nom_compagnie']
    
    def get_queryset(self):
        print("DEBUG: CompagnieViewSet.get_queryset called")
        try:
            qs = Compagnie.objects.all()
            print(f"DEBUG: Compagnie Queryset Count: {qs.count()}")
            return qs
        except Exception as e:
            print(f"DEBUG: Error in CompagnieViewSet: {e}")
            return Compagnie.objects.none()

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Récupérer tous les contacts d'une compagnie"""
        contacts = ContactCompagnie.objects.filter(
            id_compagnie=pk,
            effacer=False  # TODO: Handle NULLs here too if needed
        )
        serializer = ContactCompagnieSerializer(contacts, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Enregistrer l'utilisateur qui a créé la compagnie"""
        user_id = self.request.user.id if self.request.user.is_authenticated else None
        serializer.save(idutilisateur_save=user_id)

    def perform_update(self, serializer):
        """Enregistrer l'utilisateur qui a modifié la compagnie"""
        user_id = self.request.user.id if self.request.user.is_authenticated else None
        serializer.save(idutilisateur_save=user_id)

    def perform_destroy(self, instance):
        instance.effacer = True
        instance.save()


class ContactCompagnieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les contacts des compagnies
    """
    # queryset = ContactCompagnie.objects.filter(effacer=False)
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
        # Base queryset avec soft delete
        from django.db.models import Q
        queryset = ContactCompagnie.objects.filter(Q(effacer=False) | Q(effacer__isnull=True))
        
        # Filtre par compagnie
        id_compagnie = self.request.query_params.get('id_compagnie', None)
        if id_compagnie:
            queryset = queryset.filter(id_compagnie=id_compagnie)
            
        return queryset

    def perform_destroy(self, instance):
        instance.effacer = True
        instance.save()


class FraisAccessoireViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les frais accessoires des compagnies
    """
    serializer_class = 'FraisAccessoireSerializer'
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['interv_min', 'interv_max']
    ordering = ['interv_min']
    
    def get_queryset(self):
        """
        Filtrage par compagnie
        """
        from django.db.models import Q
        from .models import FraisAccessoire
        
        queryset = FraisAccessoire.objects.filter(Q(effacer=False) | Q(effacer__isnull=True))
        
        # Filtre par compagnie
        id_compagnie = self.request.query_params.get('id_compagnie', None)
        if id_compagnie:
            queryset = queryset.filter(id_compagnie=id_compagnie)
            
        return queryset
    
    def get_serializer_class(self):
        from .serializers import FraisAccessoireSerializer
        return FraisAccessoireSerializer

    def perform_destroy(self, instance):
        """Soft delete"""
        instance.effacer = True
        instance.save()

