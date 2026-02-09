"""
Serializers pour l'authentification
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Utilisateur"""
    
    class Meta:
        model = Utilisateur
        fields = [
            'idutilisateur',
            'nom_utilisateur',
            'adresse_email',
            'tel_utilisateur',
            'role_utilisateur',
            'login_utilisateur',
            'code_agence',
            'est_desactiver',
            'date_enreg',
        ]
        read_only_fields = ['idutilisateur', 'date_enreg']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personnalisé pour JWT avec informations utilisateur"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Vérifier si l'utilisateur est désactivé
        if self.user.est_desactiver:
            raise serializers.ValidationError(
                "Ce compte est désactivé. Contactez l'administrateur."
            )
        
        # Vérifier si l'utilisateur est supprimé (soft delete)
        if self.user.effacer:
            raise serializers.ValidationError("Ce compte n'existe plus.")
        
        # Ajouter les informations utilisateur au token
        data['user'] = {
            'id': self.user.idutilisateur,
            'nom': self.user.nom_utilisateur,
            'email': self.user.adresse_email,
            'role': self.user.role_utilisateur,
            'agence': self.user.code_agence,
        }
        
        return data


class LoginSerializer(serializers.Serializer):
    """Serializer pour le login"""
    login = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer pour le changement de mot de passe et d'identifiant
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_login = serializers.CharField(required=False, allow_blank=True, help_text="Nouveau login utilisateur (optionnel)")

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate_new_login(self, value):
        from .models import Utilisateur
        # Si un login est fourni, vérifier qu'il n'est pas déjà pris
        if value:
            # On exclut l'utilisateur courant de la vérification dans la vue, 
            # mais ici on vérifie juste s'il existe.
            # La validation finale contextuelle se fera idéalement dans la vue ou avec accès au context user
            pass
        return value
