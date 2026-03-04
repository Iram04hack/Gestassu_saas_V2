"""
Views pour le module Tâches
"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Tache
from .serializers import TacheSerializer


class TacheViewSet(viewsets.ModelViewSet):
    queryset = Tache.objects.filter(effacer=False)
    serializer_class = TacheSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['id_client', 'statut_tache', 'idutilisateur_affecter']
    search_fields = ['titre_tache', 'description_tache']
    ordering_fields = ['date_creation_tache', 'date_echeance_tache']
    ordering = ['-date_creation_tache']

    def get_queryset(self):
        queryset = super().get_queryset()
        client_id = self.request.query_params.get('client_id', None)
        if client_id:
            queryset = queryset.filter(id_client=client_id)
        # Filtre par statut string -> int
        statut_str = self.request.query_params.get('statut', None)
        if statut_str:
            mapping = {'en_attente': 0, 'en_cours': 1, 'termine': 2}
            statut_int = mapping.get(statut_str)
            if statut_int is not None:
                queryset = queryset.filter(statut_tache=statut_int)
        return queryset

    def perform_create(self, serializer):
        from django.utils import timezone
        import uuid
        now = timezone.now()
        user_id = getattr(self.request.user, 'idutilisateur', None) or ''
        serializer.save(
            idtaches=str(uuid.uuid4()),
            date_creation_tache=now,
            date_enreg=now,
            effacer=False,
            sync=False,
            idutilisateur_save=user_id,
        )
