"""
Serializers pour le module Produits
"""
from rest_framework import serializers
from .models import Produit, GroupeProduit, CatVehicule


class GroupeProduitSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle GroupeProduit"""
    class Meta:
        model = GroupeProduit
        fields = '__all__'


class ProduitSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Produit"""
    nom_groupe = serializers.SerializerMethodField()
    
    class Meta:
        model = Produit
        fields = '__all__'
        
    def get_nom_groupe(self, obj):
        try:
            if obj.code_groupe_prod:
                groupe = GroupeProduit.objects.filter(code_groupe_prod=obj.code_groupe_prod).first()
                return groupe.lib_groupe_prod if groupe else None
            return None
        except Exception:
            return None


class CatVehiculeSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle CatVehicule"""
    class Meta:
        model = CatVehicule
        fields = '__all__'
