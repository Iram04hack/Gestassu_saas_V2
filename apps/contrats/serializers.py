"""
Serializers pour le module Contrats
"""
from rest_framework import serializers
from .models import Contrat


class ContratSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Contrat"""
    
    # Champs calculés
    nom_compagnie = serializers.SerializerMethodField()
    nom_produit = serializers.SerializerMethodField()
    nom_agence = serializers.SerializerMethodField()
    statut = serializers.SerializerMethodField()
    
    class Meta:
        model = Contrat
        fields = [
            'id_contrat',
            'estprojet',
            'numPolice',
            'date_acte',
            'date_effet',
            'Date_echeance',
            'duree_contrat',
            'ID_Client',
            'produit',  # ID du produit via FK
            'nom_produit',
            'prime_nette_brute',
            'reductions',
            'prime_net_red',
            'compagnie',  # ID de la compagnie via FK
            'nom_compagnie',
            'accessoires',
            'taxe',
            'CEMAC',
            'CSS',
            'TSVL',
            'CCA',
            'prime_totale',
            'montant_reductions',
            'nature_contrat',
            'type_doc',
            'attestation_jaune',
            'attestation_rose',
            'commission_courtier',
            'CodeAgence',
            'nom_agence',
            'numAvenant',
            'code_apporteur',
            'taux_com_apporteur',
            'montant_com_apporteur',
            'type_contrat',
            'surprime_taux',
            'surprime_fixe',
            'montant_surprime',
            'fractionnement',
            'est_suspendu',
            'date_début_suspension',
            'date_fin_suspension',
            'Motif_avenant',
            'duree_paiement',
            'frequence_paiement',
            'observation',
            'piece_justif',
            'est_resilier',
            'date_resiliation',
            'prime_ristone',
            'numPolice_assureur',
            'generation_auto_cotisation',
            'date_enreg',
            'date_modif',
            'IDUTILISATEUR_save', # Ajout demandé (Enreg.Par)
            'statut',
        ]
    
    def get_nom_compagnie(self, obj):
        """Récupère le nom de la compagnie via la relation"""
        try:
            return obj.compagnie.nom_compagnie if obj.compagnie else "-"
        except Exception:
            return "-"
    
    def get_nom_produit(self, obj):
        """Récupère le nom du produit via la relation"""
        try:
            return obj.produit.lib_produit if obj.produit else "-"
        except Exception:
            return "-"
    
    def get_nom_agence(self, obj):
        """Récupère le nom de l'agence"""
        try:
            from core.models import Agence
            if obj.CodeAgence:
                agence = Agence.objects.filter(codeagence=obj.CodeAgence).first()
                return agence.nomagence if agence else "-"
            return "-"
        except Exception:
            return "-"
    
    def get_statut(self, obj):
        """Détermine le statut du contrat"""
        if obj.est_resilier:
            return "Résilié"
        elif obj.est_suspendu:
            return "Suspendu"
        elif obj.estprojet:
            return "Projet"
        else:
            return "Actif"
