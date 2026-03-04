"""
Serializers pour le module Tâches
"""
from rest_framework import serializers
from .models import Tache


class TacheSerializer(serializers.ModelSerializer):
    nom_utilisateur_affecte = serializers.SerializerMethodField()
    nom_client = serializers.SerializerMethodField()
    statut_label = serializers.SerializerMethodField()

    class Meta:
        model = Tache
        fields = '__all__'

    def get_nom_utilisateur_affecte(self, obj):
        if obj.idutilisateur_affecter:
            try:
                from authentication.models import Utilisateur
                user = Utilisateur.objects.filter(idutilisateur=obj.idutilisateur_affecter).first()
                return user.nom_utilisateur if user else None
            except Exception:
                return None
        return None

    def get_nom_client(self, obj):
        if obj.id_client:
            try:
                from crm.models import Client
                client = Client.objects.filter(id_client=obj.id_client).first()
                if client:
                    return f"{client.nom_client or ''} {client.prenom_client or ''}".strip()
            except Exception:
                return None
        return None

    def get_statut_label(self, obj):
        labels = {0: 'En attente', 1: 'En cours', 2: 'Terminé'}
        return labels.get(obj.statut_tache, 'Inconnu')
