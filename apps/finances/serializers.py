"""
Serializers pour le module Finances
"""
from rest_framework import serializers
from .models import Mouvement, TypeMouvementManuel, TypeMouvementAutomatique, Caisse


class MouvementSerializer(serializers.ModelSerializer):
    debit = serializers.FloatField(source='debit_amount', read_only=True)
    credit = serializers.FloatField(source='credit_amount', read_only=True)
    
    class Meta:
        model = Mouvement
        fields = '__all__'


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
    class Meta:
        model = Caisse
        fields = '__all__'
