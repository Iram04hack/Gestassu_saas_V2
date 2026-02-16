from rest_framework import serializers
from .models import Apporteur, CommissionApporteur

class CommissionApporteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionApporteur
        fields = '__all__'

class ApporteurSerializer(serializers.ModelSerializer):
    commissions = CommissionApporteurSerializer(many=True, read_only=True)
    nombre_contrats = serializers.SerializerMethodField()

    class Meta:
        model = Apporteur
        fields = '__all__'
        extra_kwargs = {
            'mot_de_passe': {'write_only': True}
        }

    def get_nombre_contrats(self, obj):
        # Pour l'instant 0, à connecter avec Contrat si besoin d'info temps réel
        # Ou via une méthode optimisée dans le ViewSet
        return 0
