"""
Serializers pour le module Compagnies
"""
from rest_framework import serializers
from .models import Compagnie, ContactCompagnie, FraisAccessoire
import uuid


class CompagnieSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Compagnie
    """
    contacts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Compagnie
        fields = '__all__'
        read_only_fields = ['date_enreg', 'date_modif', 'daterecupserveur']

    def get_contacts_count(self, obj):
        """Compter le nombre de contacts actifs pour cette compagnie"""
        from django.db.models import Q
        return ContactCompagnie.objects.filter(
            id_compagnie=obj.id_compagnie
        ).filter(
            Q(effacer=False) | Q(effacer__isnull=True)
        ).count()

    def create(self, validated_data):
        """Générer un ID unique lors de la création"""
        if 'id_compagnie' not in validated_data or not validated_data['id_compagnie']:
            validated_data['id_compagnie'] = f"CMP{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class ContactCompagnieSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle ContactCompagnie
    """
    class Meta:
        model = ContactCompagnie
        fields = '__all__'
        read_only_fields = ['date_enreg', 'date_modif', 'daterecupserveur']

    def create(self, validated_data):
        """Générer un ID unique lors de la création"""
        if 'idcontact_compagnie' not in validated_data or not validated_data['idcontact_compagnie']:
            validated_data['idcontact_compagnie'] = f"CTCT{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class FraisAccessoireSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle FraisAccessoire
    """
    class Meta:
        model = FraisAccessoire
        fields = '__all__'
        read_only_fields = ['daterecupserveur']

    def create(self, validated_data):
        """Générer un ID unique lors de la création"""
        if 'idfraisaccess' not in validated_data or not validated_data['idfraisaccess']:
            validated_data['idfraisaccess'] = f"FACC{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)
