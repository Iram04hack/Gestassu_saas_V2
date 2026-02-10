"""
Vues pour l'authentification JWT
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Utilisateur
from .serializers import (
    UtilisateurSerializer,
    CustomTokenObtainPairSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vue personnalisée pour obtenir les tokens JWT"""
    serializer_class = CustomTokenObtainPairSerializer


from django.db.models import Q

import traceback
import sys

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Vue de login
    POST: { "login": "username_or_email", "password": "password" }
    """
    try:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        login_input = serializer.validated_data['login']
        password = serializer.validated_data['password']
        
        try:
            # Chercher l'utilisateur par login OU email
            user = Utilisateur.objects.filter(
                Q(login_utilisateur__iexact=login_input) | 
                Q(adresse_email__iexact=login_input)
            ).first()
            
            if not user:
                # Fallback exact match just in case
                if '@' in login_input:
                     user = Utilisateur.objects.filter(adresse_email__iexact=login_input).first()
                else:
                     user = Utilisateur.objects.filter(login_utilisateur__iexact=login_input).first()
                
            if not user:
                 raise Utilisateur.DoesNotExist

            # Vérifications
            if user.est_desactiver:
                return Response(
                    {'error': 'Ce compte est désactivé. Contactez l\'administrateur.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if user.effacer:
                return Response(
                    {'error': 'Ce compte n\'existe plus.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Vérifier le mot de passe
            if not user.check_password(password):
                return Response(
                    {'error': 'Login ou mot de passe incorrect.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Générer les tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.idutilisateur,
                    'nom': user.nom_utilisateur,
                    'email': user.adresse_email,
                    'role': user.role_utilisateur,
                    'agence': user.code_agence,
                }
            })
            
        except Utilisateur.DoesNotExist:
            return Response(
                {'error': 'Login ou mot de passe incorrect.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except Exception as e:
        # Log the full traceback to a file
        with open('c:/projets_django/Gestassu_saas_V2/login_debug.log', 'w') as f:
            f.write(f"Error in login_view: {str(e)}\n")
            traceback.print_exc(file=f)
        raise e


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Vue de logout (blacklist le refresh token)"""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {'message': 'Déconnexion réussie.'}, 
            status=status.HTTP_200_OK
        )
    except Exception:
        return Response(
            {'error': 'Token invalide.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Récupérer les informations de l'utilisateur connecté"""
    serializer = UtilisateurSerializer(request.user)
    return Response(serializer.data)


class ChangePasswordView(generics.UpdateAPIView):
    """
    Endpoint pour changer son propre mot de passe.
    """
    serializer_class = ChangePasswordSerializer
    model = Utilisateur
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Vérifier l'ancien mot de passe
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Mot de passe incorrect."]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Mise à jour du mot de passe
            self.object.set_password(serializer.data.get("new_password"))
            
            # Mise à jour du login si fourni
            new_login = serializer.data.get("new_login")
            if new_login:
                self.object.login_utilisateur = new_login
            
            self.object.save()
            return Response({"message": "Compte mis à jour avec succès."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
