"""
Serializers pour le module Produits
"""
from rest_framework import serializers
from .models import Produit, GroupeProduit, CatVehicule, CommissionCategorie


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


class CommissionCategorieSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle CommissionCategorie"""
    lib_cat = serializers.SerializerMethodField()
    nom_compagnie = serializers.SerializerMethodField()

    class Meta:
        model = CommissionCategorie
        fields = '__all__'

    def get_lib_cat(self, obj):
        try:
            # Récupérer le libellé depuis CatVehicule
            cat = CatVehicule.objects.filter(code_cat=obj.code_cat).first()
            return cat.lib_cat if cat else obj.code_cat
        except:
            return obj.code_cat

    def get_nom_compagnie(self, obj):
        from compagnies.models import Compagnie
        try:
            comp = Compagnie.objects.filter(id_compagnie=obj.id_compagnie).first()
            return comp.nom_compagnie if comp else obj.id_compagnie
        except:
            return obj.id_compagnie

