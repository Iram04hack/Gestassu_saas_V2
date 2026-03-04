"""
Serializers pour le module Finances
"""
from rest_framework import serializers
from .models import Mouvement, TypeMouvementManuel, TypeMouvementAutomatique, Caisse, Quittance


class MouvementSerializer(serializers.ModelSerializer):
    debit = serializers.FloatField(source='debit_amount', read_only=True)
    credit = serializers.FloatField(source='credit_amount', read_only=True)
    nom_utilisateur_resolu = serializers.SerializerMethodField()

    class Meta:
        model = Mouvement
        fields = '__all__'
        # idmouvement est le PK généré côté serveur dans perform_create
        read_only_fields = ['idmouvement', 'date_enreg_mvt', 'solde_caisse', 'num_mvt']

    def to_internal_value(self, data):
        """
        Remapper les noms DB (envoyés par le frontend) vers les noms Python du modèle.
        IDCaisse → id_caisse, LibType_Mouvement → lib_type_mvt, IDTYPE_MVT → id_type_mvt
        """
        mapping = {
            'IDCaisse': 'id_caisse',
            'LibType_Mouvement': 'lib_type_mvt',
            'IDTYPE_MVT': 'id_type_mvt',
        }
        mutable = data.copy() if hasattr(data, 'copy') else dict(data)
        for src, dst in mapping.items():
            if src in mutable and dst not in mutable:
                mutable[dst] = mutable.pop(src)
        return super().to_internal_value(mutable)

    def get_nom_utilisateur_resolu(self, obj):
        # Utilise Nom_utilisateur si déjà renseigné, sinon résout via IDUTILISATEUR_save
        if obj.nom_utilisateur:
            return obj.nom_utilisateur
        if not obj.id_utilisateur_save:
            return None
        try:
            from django.apps import apps
            Utilisateur = apps.get_model('authentication', 'Utilisateur')
            u = Utilisateur.objects.filter(idutilisateur=obj.id_utilisateur_save).first()
            return (u.nom_utilisateur or '').strip() or None if u else None
        except Exception:
            return None


class TypeMouvementSerializer(serializers.ModelSerializer):
    # Make all fields except lib_type_mouvement optional
    acteur = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_synchro = serializers.DateTimeField(required=False, allow_null=True)
    daterecupserveur = serializers.DateTimeField(required=False, allow_null=True)
    
    class Meta:
        model = TypeMouvementAutomatique
        fields = ['id_type_mvt', 'lib_type_mouvement', 'type_op', 'acteur', 'effacer', 'date_synchro', 'daterecupserveur']
        read_only_fields = ['id_type_mvt']  # ID is auto-generated


class CaisseSerializer(serializers.ModelSerializer):
    # Alias pour compatibilité frontend (lib_caisse → nom_caisse en DB)
    lib_caisse = serializers.CharField(source='nom_caisse', read_only=True)

    class Meta:
        model = Caisse
        fields = ['id_caisse', 'lib_caisse', 'nom_caisse', 'solde_caisse', 'code_agence', 'effacer']


class QuittanceSerializer(serializers.ModelSerializer):
    # etat_quittance : -1=Annulée, 0=En attente, 1=Soldée (champ réel en DB)
    etat_label = serializers.SerializerMethodField()
    nom_client = serializers.SerializerMethodField()
    id_client = serializers.SerializerMethodField()
    nom_compagnie = serializers.SerializerMethodField()
    num_police = serializers.SerializerMethodField()
    lib_produit = serializers.SerializerMethodField()
    nature_contrat = serializers.SerializerMethodField()
    type_doc = serializers.SerializerMethodField()
    date_effet = serializers.SerializerMethodField()
    date_echeance = serializers.SerializerMethodField()
    emis_par = serializers.SerializerMethodField()
    agence = serializers.SerializerMethodField()
    montant_encaisse = serializers.SerializerMethodField()
    reste_a_payer = serializers.SerializerMethodField()

    class Meta:
        model = Quittance
        fields = [
            'idquittance', 'id_contrat', 'numquittance',
            'prime_totale', 'date_enreg', 'etat_quittance', 'etat_label',
            'prime_reverse', 'est_regle_chez_assureur', 'idutilisateur',
            'observation_quittance', 'effacer',
            'nom_client', 'id_client', 'nom_compagnie', 'num_police', 'lib_produit',
            'nature_contrat', 'type_doc', 'date_effet', 'date_echeance', 'emis_par', 'agence',
            'montant_encaisse', 'reste_a_payer',
        ]

    def get_montant_encaisse(self, obj):
        from django.db.models import Sum
        total = Mouvement.objects.filter(
            idquittance=obj.idquittance, effacer=False
        ).aggregate(t=Sum('mont_debit'))['t']
        return float(total or 0)

    def get_reste_a_payer(self, obj):
        from django.db.models import Sum
        total = Mouvement.objects.filter(
            idquittance=obj.idquittance, effacer=False
        ).aggregate(t=Sum('mont_debit'))['t']
        prime = float(obj.prime_totale or 0)
        encaisse = float(total or 0)
        return max(0, prime - encaisse)

    def get_etat_label(self, obj):
        mapping = {-1: 'Annulée', 0: 'En attente', 1: 'Soldée'}
        return mapping.get(obj.etat_quittance, 'Inconnu')

    def _get_contrat(self, obj):
        cache = self.context.get('contrats_map', {})
        return cache.get(obj.id_contrat)

    def _get_client(self, obj):
        contrat = self._get_contrat(obj)
        if not contrat:
            return None
        try:
            from django.apps import apps
            Client = apps.get_model('crm', 'Client')
            return Client.objects.filter(id_client=contrat.ID_Client).first()
        except Exception:
            return None

    def get_nom_client(self, obj):
        client = self._get_client(obj)
        if not client:
            return '-'
        if client.est_entreprise:
            return (client.nom_client or '').strip() or '-'
        prenom = (client.prenom_client or '').strip()
        nom = (client.nom_client or '').strip()
        return f"{prenom} {nom}".strip() or '-'

    def get_id_client(self, obj):
        client = self._get_client(obj)
        return str(client.id_client) if client else None

    def get_nom_compagnie(self, obj):
        contrat = self._get_contrat(obj)
        if contrat and contrat.compagnie:
            return contrat.compagnie.nom_compagnie or '-'
        return '-'

    def get_num_police(self, obj):
        contrat = self._get_contrat(obj)
        return (contrat.numPolice or '-') if contrat else '-'

    def get_lib_produit(self, obj):
        contrat = self._get_contrat(obj)
        if contrat and contrat.produit:
            return contrat.produit.lib_produit or '-'
        return '-'

    def get_nature_contrat(self, obj):
        contrat = self._get_contrat(obj)
        return (contrat.nature_contrat or '-') if contrat else '-'

    def get_type_doc(self, obj):
        contrat = self._get_contrat(obj)
        return (contrat.type_doc or '-') if contrat else '-'

    def get_date_effet(self, obj):
        contrat = self._get_contrat(obj)
        return str(contrat.date_effet) if contrat and contrat.date_effet else None

    def get_date_echeance(self, obj):
        contrat = self._get_contrat(obj)
        return str(contrat.Date_echeance) if contrat and contrat.Date_echeance else None

    def get_emis_par(self, obj):
        """Nom de l'utilisateur qui a émis la quittance"""
        if not obj.idutilisateur:
            return '-'
        try:
            from django.apps import apps
            Utilisateur = apps.get_model('authentication', 'Utilisateur')
            u = Utilisateur.objects.filter(idutilisateur=obj.idutilisateur).first()
            if not u:
                return '-'
            return (u.nom_utilisateur or '').strip() or '-'
        except Exception:
            return '-'

    def get_agence(self, obj):
        contrat = self._get_contrat(obj)
        if not contrat or not contrat.CodeAgence:
            return '-'
        try:
            from django.apps import apps
            Agence = apps.get_model('core', 'Agence')
            agence = Agence.objects.filter(codeagence=contrat.CodeAgence).first()
            return (agence.nomagence or '-') if agence else '-'
        except Exception:
            return '-'
