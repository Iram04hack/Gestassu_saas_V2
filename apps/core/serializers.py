"""
Serializers pour l'application Core
"""
import uuid
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
        read_only_fields = ['date_enreg', 'date_modif']

    def create(self, validated_data):
        if not validated_data.get('codeagence'):
            validated_data['codeagence'] = f"AGE{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class InfoSocieteSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle InfoSociete"""

    class Meta:
        model = InfoSociete
        fields = [
            'raisonsocial',
            'adressesociete',
            'telsociete',
            'emailsociete',
            'logosociete',
            'bp_courtier',
            'fax_courtier',
            'basdepage',
            'param_CEMAC',
            'param_CCA',
        ]
