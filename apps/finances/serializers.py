"""
Serializers pour le module Finances
"""
from rest_framework import serializers
from .models import Mouvement, TypeMouvementManuel, Caisse


class MouvementSerializer(serializers.ModelSerializer):
    debit = serializers.FloatField(source='debit_amount', read_only=True)
    credit = serializers.FloatField(source='credit_amount', read_only=True)
    
    class Meta:
        model = Mouvement
        fields = '__all__'


class TypeMouvementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeMouvementManuel
        fields = '__all__'


class CaisseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caisse
        fields = '__all__'
