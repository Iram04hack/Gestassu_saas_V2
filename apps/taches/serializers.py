"""
Serializers pour le module Tâches
"""
from rest_framework import serializers
from .models import Tache


class TacheSerializer(serializers.ModelSerializer):
    # Champs calculés pour afficher le nom de l'utilisateur assigné
    nom_utilisateur_affecte = serializers.SerializerMethodField()
    role_utilisateur_affecte = serializers.SerializerMethodField()
    nom_client = serializers.SerializerMethodField()
    
    class Meta:
        model = Tache
        fields = '__all__'
    
    def get_nom_utilisateur_affecte(self, obj):
        """Récupère le nom de l'utilisateur affecté"""
        if obj.affecter_a:
            try:
                from authentication.models import Utilisateur
                user = Utilisateur.objects.filter(idutilisateur=obj.affecter_a).first()
                return user.nom_utilisateur if user else None
            except Exception:
                return None
        return None
    
    def get_role_utilisateur_affecte(self, obj):
        """Récupère le rôle de l'utilisateur affecté"""
        if obj.affecter_a:
            try:
                from authentication.models import Utilisateur
                user = Utilisateur.objects.filter(idutilisateur=obj.affecter_a).first()
                return user.role_utilisateur if user else None
            except Exception:
                return None
        return None
    
    def get_nom_client(self, obj):
        """Récupère le nom du client"""
        if obj.id_client:
            try:
                from crm.models import Client
                client = Client.objects.filter(id=obj.id_client).first()
                if client:
                    return f"{client.nom_client or ''} {client.prenom_client or ''}".strip()
            except Exception:
                return None
        return None
