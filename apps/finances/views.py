"""
Views pour le module Finances
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Mouvement, TypeMouvementManuel, TypeMouvementAutomatique, Caisse
from .serializers import MouvementSerializer, TypeMouvementSerializer, CaisseSerializer


class MouvementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les mouvements financiers
    """
    queryset = Mouvement.objects.filter(effacer=False)
    serializer_class = MouvementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['idtransfert', 'nature_compte', 'id_type_mvt', 'id_caisse']
    search_fields = ['lib_type_mvt', 'observation']
    ordering_fields = ['datemouvement', 'date_enreg_mvt']
    ordering = ['-datemouvement']
    
    def get_queryset(self):
        """
        Filtrage personnalisé
        """
        queryset = super().get_queryset()
        
        # Filtre par client (idtransfert) et nature_compte='CLIENT'
        client_id = self.request.query_params.get('client_id', None)
        if client_id:
            queryset = queryset.filter(idtransfert=client_id)
            
        # Filtre par période
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        
        if date_debut:
            queryset = queryset.filter(datemouvement__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(datemouvement__lte=date_fin)
            
        return queryset

    @action(detail=False, methods=['get'])
    def types(self, request):
        """
        Retourne les types de mouvements automatiques
        """
        types = TypeMouvementAutomatique.objects.filter(effacer=False)
        serializer = TypeMouvementSerializer(types, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def caisses(self, request):
        """
        Retourne les caisses disponibles
        """
        caisses = Caisse.objects.filter(effacer=False)
        serializer = CaisseSerializer(caisses, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        from django.utils import timezone
        serializer.save(date_enreg_mvt=timezone.now(), solde_caisse="0") # Placeholder pour solde caisse



class TypeMouvementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les types de mouvements automatiques
    """
    permission_classes = [IsAuthenticated]
    queryset = TypeMouvementAutomatique.objects.filter(effacer=False)
    serializer_class = TypeMouvementSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['lib_type_mouvement', 'id_type_mvt']
    ordering_fields = ['lib_type_mouvement']
    ordering = ['lib_type_mouvement']
    
    def perform_create(self, serializer):
        # Génération ID automatique
        import uuid
        generated_id = f"TMVT{str(uuid.uuid4().hex[:6]).upper()}"
        serializer.save(id_type_mvt=generated_id)

    def perform_destroy(self, instance):
        # Soft delete
        instance.effacer = True
        instance.save()


class CaisseViewSet(viewsets.ModelViewSet):
    queryset = Caisse.objects.filter(effacer=False)
    serializer_class = CaisseSerializer
