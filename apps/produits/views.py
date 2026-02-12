"""
Views pour le module Produits
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Produit, GroupeProduit, CatVehicule, CommissionCategorie
from .serializers import ProduitSerializer, GroupeProduitSerializer, CatVehiculeSerializer, CommissionCategorieSerializer


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


class CatVehiculeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories de véhicules
    """
    queryset = CatVehicule.objects.filter(effacer=False)
    serializer_class = CatVehiculeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['enable_flotte', 'sync']
    search_fields = ['lib_cat', 'code_cat']
    ordering_fields = ['lib_cat']
    ordering = ['lib_cat']

    ordering = ['lib_cat']

    def perform_destroy(self, instance):
        """
        Soft delete: Marquer comme effacé au lieu de supprimer physiquement
        """
        instance.effacer = True
        instance.save()


class CommissionCategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les commissions par catégorie
    """
    queryset = CommissionCategorie.objects.filter(effacer=False)
    serializer_class = CommissionCategorieSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['code_cat', 'id_compagnie']
    search_fields = ['code_cat', 'id_compagnie']
    ordering_fields = ['code_cat', 'id_compagnie']
    ordering = ['code_cat']

    ordering = ['code_cat']
    
    def create(self, request, *args, **kwargs):
        """
        Custom create to handle Upsert (Update if exists, else Create)
        Based on composite key (code_cat + id_compagnie)
        """
        code_cat = request.data.get('code_cat')
        id_compagnie = request.data.get('id_compagnie')
        
        if not code_cat or not id_compagnie:
            from rest_framework.response import Response
            from rest_framework import status
            return Response(
                {"error": "code_cat and id_compagnie are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if exists (including soft deleted ones? No, if soft deleted, we resurrect or update?)
        # Let's say if exists, we update.
        instance = CommissionCategorie.objects.filter(
            code_cat=code_cat, 
            id_compagnie=id_compagnie
        ).first()
        
        if instance:
            # Update
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            # Ensure resurrected if it was deleted
            if instance.effacer:
                serializer.save(effacer=False)
            else:
                serializer.save()
                
            return Response(serializer.data)
        else:
            # Create
            return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def delete_custom(self, request):
        """
        Custom delete using composite key in body
        """
        code_cat = request.data.get('code_cat')
        id_compagnie = request.data.get('id_compagnie')
        
        if not code_cat or not id_compagnie:
             from rest_framework.response import Response
             from rest_framework import status
             return Response(
                {"error": "code_cat and id_compagnie are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        instance = CommissionCategorie.objects.filter(
            code_cat=code_cat, 
            id_compagnie=id_compagnie
        ).first()
        
        if instance:
            instance.effacer = True
            instance.save()
            return Response({"status": "deleted"})
        else:
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def perform_destroy(self, instance):
        """Soft delete (Standard ID)"""
        instance.effacer = True
        instance.save()



