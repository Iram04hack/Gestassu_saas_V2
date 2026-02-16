"""
Serializers pour le module Contrats
"""
from rest_framework import serializers
from .models import Contrat
from django.apps import apps


class RisqueSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Risques"""
    class Meta:
        model = apps.get_model('contrats', 'Risques')
        fields = [
            'id_risque', 'type_risque', 'designation_risque', 
            'veh_marque', 'veh_modele', 'veh_immat', 
            'veh_chassis', 'veh_type', 'veh_puissance', 'veh_nbplace'
        ]

class ContratSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Contrat"""
    
    # Champs calculés
    nom_compagnie = serializers.SerializerMethodField()
    nom_produit = serializers.SerializerMethodField()
    nom_agence = serializers.SerializerMethodField()
    statut = serializers.SerializerMethodField()
    nom_client_complet = serializers.SerializerMethodField()
    risques = serializers.SerializerMethodField()
    
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
            'nom_produit',
            'prime_nette_brute',
            'reductions',
            'prime_net_red',
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
            'date_debut_suspension',
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
            'IDUTILISATEUR_save',
            'statut',
            'nom_client_complet',
            'risques',
        ]
    
    def get_risques(self, obj):
        """Récupère les risques associés au contrat avec les attestations affectées"""
        try:
            ContratRisques = apps.get_model('contrats', 'ContratRisques')
            Risques = apps.get_model('contrats', 'Risques')
            
            # Trouver les liens
            liens = ContratRisques.objects.filter(id_contrat=obj.id_contrat)
            
            result = []
            for lien in liens:
                risque = Risques.objects.filter(id_risque=lien.id_risque).first()
                if risque:
                    data = RisqueSerializer(risque).data
                    # Ajouter les infos du lien (Attestations assignées)
                    data['attestation_jaune'] = lien.attestation_jaune
                    data['attestation_rose'] = lien.attestation_rose
                    result.append(data)
            
            return result
        except Exception as e:
            print(f"Erreur get_risques: {e}")
            return []
    
    def get_nom_compagnie(self, obj):
        """Récupère le nom de la compagnie via la relation"""
        try:
            if hasattr(obj, 'compagnie') and obj.compagnie:
                if hasattr(obj.compagnie, 'nom_compagnie'):
                    return obj.compagnie.nom_compagnie
            return "-"
        except Exception:
            return "-"
    
    def get_nom_produit(self, obj):
        """Récupère le nom du produit via la relation"""
        try:
            if hasattr(obj, 'produit') and obj.produit:
                if hasattr(obj.produit, 'lib_produit'):
                    return obj.produit.lib_produit
            return "-"
        except Exception:
            return "-"
    
    def get_nom_client_complet(self, obj):
        """Récupère le nom complet du client"""
        try:
            if not obj.ID_Client:
                return "-"
            # Importation locale pour éviter les imports circulaires si nécessaire, 
            # mais ici on a déjà importé Client en haut.
            # Importation locale pour éviter les imports circulaires
            from apps.crm.models import Client
            client = Client.objects.filter(id_client=obj.ID_Client).first()
            if client:
                nom = client.nom_client or ""
                prenom = client.prenom_client or ""
                return f"{nom} {prenom}".strip()
            return "-"
        except Exception:
            return "-"

    def get_nom_agence(self, obj):
        """Récupère le nom de l'agence"""
        try:
            if not obj.CodeAgence:
                return "-"
            from django.apps import apps
            Agence = apps.get_model('core', 'Agence')
            agence = Agence.objects.filter(codeagence=obj.CodeAgence).first()
            return agence.nomagence if agence else "-"
        except Exception:
            return "-"
    
    def get_statut(self, obj):
        """Détermine le statut du contrat"""
        try:
            if obj.est_resilier:
                return "Résilié"
            elif obj.est_suspendu:
                return "Suspendu"
            elif obj.estprojet:
                return "Projet"
            else:
                return "Actif"
        except Exception:
            return "Inconnu"
