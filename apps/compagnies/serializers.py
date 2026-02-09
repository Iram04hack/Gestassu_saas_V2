"""
Serializers pour le module Compagnies
"""
from rest_framework import serializers
from .models import Compagnie, ContactCompagnie


class CompagnieSerializer(serializers.ModelSerializer):
    """Serializer pour le model Compagnie"""
    
    class Meta:
        model = Compagnie
        fields = [
            'id_compagnie',
            'nom_compagnie',
            'tel_compagnie',
            'adresse_compagnie',
            'email_compagnie',
            'logo',
            'url_logo',
            'codification_compagnie',
            'date_enreg',
            'date_modif',
        ]
        read_only_fields = ['date_enreg', 'date_modif']


class ContactCompagnieSerializer(serializers.ModelSerializer):
    """Serializer pour le model ContactCompagnie"""
    
    class Meta:
        model = ContactCompagnie
        fields = [
            'idcontact_compagnie',
            'id_compagnie',
            'nom_contact',
            'tel_contact',
            'whatsapp_contact',
            'email_contact',
            'fonction_contact',
            'date_enreg',
            'date_modif',
        ]
        read_only_fields = ['date_enreg', 'date_modif']
