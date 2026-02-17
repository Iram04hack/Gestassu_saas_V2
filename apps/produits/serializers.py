"""
Serializers pour le module Produits
"""
from rest_framework import serializers
from .models import Produit, GroupeProduit, CatVehicule, CommissionCategorie, Attestation, Garantie


class GroupeProduitSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle GroupeProduit"""
    class Meta:
        model = GroupeProduit
        fields = '__all__'



class GarantieSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Garantie"""
    class Meta:
        model = Garantie
        fields = '__all__'


class ProduitSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Produit"""
    nom_groupe = serializers.SerializerMethodField()
    nom_compagnie = serializers.SerializerMethodField()
    garanties_count = serializers.IntegerField(read_only=True)
    
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
    
    def get_nom_compagnie(self, obj):
        from compagnies.models import Compagnie
        try:
            if obj.Id_compagnie:
                comp = Compagnie.objects.filter(id_compagnie=obj.Id_compagnie).first()
                return comp.nom_compagnie if comp else obj.Id_compagnie
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


class AttestationSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Attestation"""
    nom_compagnie = serializers.SerializerMethodField()
    nom_agence = serializers.SerializerMethodField()
    
    class Meta:
        model = Attestation
        fields = '__all__'
    
    def get_nom_compagnie(self, obj):
        from compagnies.models import Compagnie
        try:
            if obj.id_compagnie:
                comp = Compagnie.objects.filter(id_compagnie=obj.id_compagnie).first()
                return comp.nom_compagnie if comp else obj.id_compagnie
            return None
        except:
            return obj.id_compagnie
    
    def get_nom_agence(self, obj):
        from core.models import Agence
        try:
            code_agence_val = (obj.CodeAgence or "").strip()
            if code_agence_val:
                # Utiliser codeagence (minuscule) qui est la clé primaire du modèle Agence
                # et nomagence (minuscule) qui est le champ du nom
                agence = Agence.objects.filter(codeagence=code_agence_val).first()
                return agence.nomagence if agence else code_agence_val
            return None
        except Exception as e:
            # print(f"Serializer Error Agence: {e}")
            return obj.CodeAgence


class AttestationBulkCreateSerializer(serializers.Serializer):
    """
    Serializer pour la création en masse d'attestations
    Génère automatiquement les numéros entre num_min et num_max
    """
    type_attestation = serializers.CharField(required=True, help_text="653=Rose, 652=Jaune")
    num_min = serializers.IntegerField(required=True, min_value=1)
    num_max = serializers.IntegerField(required=True, min_value=1)
    id_compagnie = serializers.CharField(required=True)
    CodeAgence = serializers.CharField(required=False, allow_blank=True)
    ref_lot = serializers.CharField(required=True)
    Remarque_attestation = serializers.CharField(required=False, allow_blank=True)
    IDUTILISATEUR_save = serializers.CharField(required=True)
    
    def validate(self, data):
        """Validation des données"""
        if data['num_max'] < data['num_min']:
            raise serializers.ValidationError({
                'num_max': 'Le numéro maximum doit être supérieur ou égal au numéro minimum'
            })
        
        # Vérifier que le nombre d'attestations n'est pas trop grand
        count = data['num_max'] - data['num_min'] + 1
        if count > 10000:
            raise serializers.ValidationError({
                'num_max': 'Impossible de générer plus de 10000 attestations à la fois'
            })
        
        return data
    
    def create(self, validated_data):
        """
        Création en masse des attestations
        Génère tous les numéros entre num_min et num_max
        """
        num_min = validated_data['num_min']
        num_max = validated_data['num_max']
        type_attestation = validated_data['type_attestation']
        id_compagnie = validated_data['id_compagnie']
        code_agence = validated_data.get('CodeAgence', '')
        ref_lot = validated_data['ref_lot']
        remarque = validated_data.get('Remarque_attestation', '')
        user_id = validated_data['IDUTILISATEUR_save']
        
        attestations_to_create = []
        
        for num in range(num_min, num_max + 1):
            # Générer un ID unique pour chaque attestation
            id_attestation = f"{type_attestation}-{id_compagnie}-{num:010d}"
            
            # Vérifier si l'attestation existe déjà
            if Attestation.objects.filter(id_attestation=id_attestation).exists():
                continue  # Sauter les doublons
            
            attestation = Attestation(
                id_compagnie=id_compagnie,  # PK dans la table
                id_attestation=id_attestation,
                Num_attestation=str(num),
                type_attestation=type_attestation,
                Etat_attestation=0,  # Neutre par défaut
                ref_lot=ref_lot,
                CodeAgence=code_agence,
                Remarque_attestation=remarque,
                idutilisateur_save=user_id,
                effacer=False,
                sync=False
            )
            attestations_to_create.append(attestation)
        
        # Création en masse
        created_attestations = Attestation.objects.bulk_create(
            attestations_to_create,
            ignore_conflicts=True  # Ignorer les conflits de clé primaire
        )
        
        return {
            'count': len(created_attestations),
            'num_min': num_min,
            'num_max': num_max,
            'attestations': created_attestations
        }


class AttestationStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques d'attestations"""
    type_attestation = serializers.CharField()
    Etat_attestation = serializers.IntegerField()
    count = serializers.IntegerField()
    etat_label = serializers.SerializerMethodField()
    
    def get_etat_label(self, obj):
        etat_map = {
            0: 'Neutre',
            1: 'Utilisé',
            2: 'Endommagé'
        }
        return etat_map.get(obj.get('Etat_attestation'), 'Inconnu')

