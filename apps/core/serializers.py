"""
Serializers pour l'application Core
"""
from rest_framework import serializers
from .models import Agence, InfoSociete


class AgenceSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Agence"""
    
    class Meta:
        model = Agence
        fields = [
            'codeagence',
            'nomagence',
            'adresseagence',
            'telagence',
            'emailagence',
            'date_enreg',
            'date_modif',
        ]
        read_only_fields = ['codeagence', 'date_enreg', 'date_modif']


class InfoSocieteSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle InfoSociete"""
    
    class Meta:
        model = InfoSociete
        fields = [
            'codesociete',
            'nomsociete',
            'adressesociete',
            'telsociete',
            'emailsociete',
            'logosociete',
            'siteweb',
            'forme_juridique',
            'numero_registre',
            'numero_orias',
            'date_enreg',
            'date_modif',
        ]
        read_only_fields = ['codesociete', 'date_enreg', 'date_modif']
