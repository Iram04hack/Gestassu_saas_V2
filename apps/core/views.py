"""
Vues pour l'application Core
"""
from rest_framework import viewsets, permissions
from .models import Agence, InfoSociete
from .serializers import AgenceSerializer, InfoSocieteSerializer


class AgenceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les agences (lecture seule)
    
    Liste et détails des agences
    """
    queryset = Agence.objects.filter(effacer=False)
    serializer_class = AgenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'codeagence'


class InfoSocieteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les informations société (lecture seule)
    
    Informations générales du courtier
    """
    queryset = InfoSociete.objects.filter(effacer=False)
    serializer_class = InfoSocieteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'codesociete'
