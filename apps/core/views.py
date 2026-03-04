"""
Vues pour l'application Core
"""
import uuid
from rest_framework import viewsets, permissions, filters
from .models import Agence, InfoSociete
from .serializers import AgenceSerializer, InfoSocieteSerializer


class AgenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les agences (CRUD complet)
    """
    serializer_class = AgenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nomagence', 'codeagence', 'emailagence']
    ordering_fields = ['nomagence', 'date_enreg']
    ordering = ['nomagence']
    lookup_field = 'codeagence'

    def get_queryset(self):
        return Agence.objects.filter(effacer=False)

    def perform_create(self, serializer):
        user_id = getattr(self.request.user, 'idutilisateur', None)
        serializer.save(idutilisateur_save=user_id)

    def perform_update(self, serializer):
        user_id = getattr(self.request.user, 'idutilisateur', None)
        serializer.save(idutilisateur_save=user_id)

    def perform_destroy(self, instance):
        instance.effacer = True
        instance.save()


class InfoSocieteViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les informations société
    Lecture + modification uniquement (pas de suppression)
    """
    serializer_class = InfoSocieteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'raisonsocial'
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        return InfoSociete.objects.filter(effacer=False)

    def perform_create(self, serializer):
        user_id = getattr(self.request.user, 'idutilisateur', None)
        serializer.save(idutilisateur_save=user_id)

    def perform_update(self, serializer):
        user_id = getattr(self.request.user, 'idutilisateur', None)
        serializer.save(idutilisateur_save=user_id)
