"""
Serializers pour le module CRM
"""
from rest_framework import serializers
from .models import Client, Interaction


class ClientSerializer(serializers.ModelSerializer):
    """Serializer pour le model Client"""
    
    # Champ calculé pour le nom complet
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id_client',
            'nom_client',
            'prenom_client',
            'nom_complet',
            'adresse',
            'email',
            'telephone',
            'tel_whatsapp',
            'date_naissance',
            'profession',
            'civilite',
            'source',
            'pays',
            'autres_informations',
            'est_entreprise',
            'representant_entreprise',
            'role_representant',
            'nif_client',
            'fax_client',
            'date_permis_cond',
            'date_enreg',
            'date_modif',
        ]
        read_only_fields = ['date_enreg', 'date_modif', 'nom_complet']
    
    def get_nom_complet(self, obj):
        """Retourne le nom complet du client"""
        if obj.est_entreprise:
            return obj.nom_client or ''
        return f"{obj.prenom_client or ''} {obj.nom_client or ''}".strip()


class InteractionSerializer(serializers.ModelSerializer):
    """Serializer pour le model Interaction"""
    
    class Meta:
        model = Interaction
        fields = [
            'idinteraction',
            'id_client',
            'type_interaction',
            'date_heure_interaction',
            'duree_interaction',
            'lieu',
            'description',
            'resultat_interaction',
            'date_rappel',
            'rappel_necessaire',
            'titre_rappel',
            'idutilisateur_action',
            'date_enreg',
            'date_modif',
        ]
        read_only_fields = ['date_enreg', 'date_modif']
