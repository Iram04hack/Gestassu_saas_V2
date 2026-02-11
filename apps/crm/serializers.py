"""
Serializers pour le module CRM
"""
from rest_framework import serializers
from .models import Client, Interaction
from django.db.models import Q


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
                ID_Client=obj.id_client, 
                effacer=False,
                estprojet=False 
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


class ClientDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un client avec toutes ses relations"""
    
    nom_complet = serializers.SerializerMethodField()
    type_client = serializers.SerializerMethodField()
    enregistre_par = serializers.SerializerMethodField()
    
    # Relations
    nombre_interactions = serializers.SerializerMethodField()
    nombre_contrats = serializers.SerializerMethodField()
    nombre_risques = serializers.SerializerMethodField()
    risques_par_type = serializers.SerializerMethodField()
    
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
            'nombre_interactions',
            'nombre_contrats',
            'nombre_risques',
            'risques_par_type',
        ]
        read_only_fields = ['date_enreg', 'date_modif', 'nom_complet', 'type_client', 'enregistre_par']
    
    def get_nom_complet(self, obj):
        """Retourne le nom complet du client"""
        if obj.est_entreprise:
            return obj.nom_client or ''
        return f"{obj.prenom_client or ''} {obj.nom_client or ''}".strip()
    
    def get_type_client(self, obj):
        """Détermine si c'est un Client ou un Prospect"""
        try:
            from contrats.models import Contrat
            if not obj.id_client:
                return "Prospect"
            has_contract = Contrat.objects.filter(
                ID_Client=obj.id_client, 
                effacer=False,
                estprojet=False
            ).exists()
            return "Client" if has_contract else "Prospect"
        except Exception:
            return "Prospect"
    
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
    
    def get_nombre_interactions(self, obj):
        """Compte le nombre d'interactions du client"""
        try:
            return Interaction.objects.filter(
                id_client=obj.id_client,
                effacer=False
            ).count()
        except Exception:
            return 0
    
    def get_nombre_contrats(self, obj):
        """Compte le nombre de contrats du client"""
        try:
            from contrats.models import Contrat
            return Contrat.objects.filter(
                id_client=obj.id_client,
                effacer=False
            ).count()
        except Exception:
            return 0
    
    def get_nombre_risques(self, obj):
        """Compte le nombre total de risques du client"""
        try:
            from contrats.models import Risques
            # Récupérer les risques via les contrats
            from contrats.models import Contrat, ContratRisques
            contrats = Contrat.objects.filter(
                id_client=obj.id_client,
                effacer=False
            ).values_list('id_contrat', flat=True)
            
            risques_ids = ContratRisques.objects.filter(
                id_contrat__in=contrats,
                effacer=False
            ).values_list('id_risque', flat=True)
            
            return Risques.objects.filter(
                id_risque__in=risques_ids,
                effacer=False
            ).count()
        except Exception:
            return 0
    
    def get_risques_par_type(self, obj):
        """Compte les risques par type (Véhicule, Crédit, Logement, Personne, Société)"""
        try:
            from contrats.models import Contrat, ContratRisques, Risques
            
            # Récupérer les contrats du client
            contrats = Contrat.objects.filter(
                id_client=obj.id_client,
                effacer=False
            ).values_list('id_contrat', flat=True)
            
            # Récupérer les risques via les contrats
            risques_ids = ContratRisques.objects.filter(
                id_contrat__in=contrats,
                effacer=False
            ).values_list('id_risque', flat=True)
            
            risques = Risques.objects.filter(
                id_risque__in=risques_ids,
                effacer=False
            )
            
            # Compter par type
            result = {
                'vehicule': 0,
                'credit': 0,
                'logement': 0,
                'personne': 0,
                'societe': 0
            }
            
            for risque in risques:
                type_risque = (risque.type_risque or '').lower()
                if 'auto' in type_risque or 'vehicule' in type_risque or 'voiture' in type_risque:
                    result['vehicule'] += 1
                elif 'credit' in type_risque or 'pret' in type_risque:
                    result['credit'] += 1
                elif 'logement' in type_risque or 'habitation' in type_risque or 'mrh' in type_risque:
                    result['logement'] += 1
                elif 'personne' in type_risque or 'vie' in type_risque or 'sante' in type_risque:
                    result['personne'] += 1
                elif 'societe' in type_risque or 'entreprise' in type_risque or 'professionnel' in type_risque:
                    result['societe'] += 1
            
            return result
        except Exception as e:
            print(f"Erreur get_risques_par_type: {e}")
            return {
                'vehicule': 0,
                'credit': 0,
                'logement': 0,
                'personne': 0,
                'societe': 0
            }


class InteractionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier une interaction"""
    
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
        ]
        read_only_fields = ['idinteraction']
    
    def create(self, validated_data):
        """Génère un ID unique pour l'interaction"""
        import uuid
        from datetime import datetime
        
        # Générer un ID unique
        validated_data['idinteraction'] = f"INT_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        return super().create(validated_data)
