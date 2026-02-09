"""
Serializers pour le module CRM
"""
from rest_framework import serializers
from .models import Client, Interaction


class ClientSerializer(serializers.ModelSerializer):
    """Serializer pour le model Client"""
    
    # Champ calculé pour le nom complet
    nom_complet = serializers.SerializerMethodField()
    type_client = serializers.SerializerMethodField()
    enregistre_par = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id_client',
            'nom_client',
            'prenom_client',
            'nom_complet',
            'type_client',
            'enregistre_par',
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
        read_only_fields = ['date_enreg', 'date_modif', 'nom_complet', 'type_client', 'enregistre_par']
    
    def get_enregistre_par(self, obj):
        """Retourne le nom de l'utilisateur qui a enregistré le client"""
        try:
            from authentication.models import Utilisateur
            user_id = obj.idutilisateur_source or obj.idutilisateur_save
            if not user_id:
                return "-"
            
            user = Utilisateur.objects.filter(idutilisateur=user_id).first()
            if user:
                return user.nom_utilisateur or user.login_utilisateur
            return "-"
        except Exception:
            return "-"

    def get_nom_complet(self, obj):
        """Retourne le nom complet du client"""
        if obj.est_entreprise:
            return obj.nom_client or ''
        return f"{obj.prenom_client or ''} {obj.nom_client or ''}".strip()

    def get_type_client(self, obj):
        """
        Détermine si c'est un Client (a un contrat) ou un Prospect.
        Vérifie l'existence d'un contrat actif (non supprimé) et non projet.
        """
        try:
            # Import local pour éviter les imports circulaires
            from contrats.models import Contrat
            
            # Vérifier que id_client n'est pas None
            if not obj.id_client:
                return "Prospect"

            has_contract = Contrat.objects.filter(
                id_client=obj.id_client, 
                effacer=False,
                est_projet=False 
            ).exists()
            
            return "Client" if has_contract else "Prospect"
        except Exception as e:
            print(f"Erreur get_type_client pour {obj.id_client}: {e}")
            return "Prospect (Erreur)"


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
