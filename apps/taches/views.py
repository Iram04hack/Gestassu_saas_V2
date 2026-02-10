"""
Views pour le module Tâches
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Tache
from .serializers import TacheSerializer


class TacheViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tâches
    """
    queryset = Tache.objects.filter(effacer=False)
    serializer_class = TacheSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['id_client', 'statut', 'affecter_a']
    search_fields = ['titre_tache', 'description_tache']
    ordering_fields = ['date_debut', 'date_echeance']
    ordering = ['-date_debut']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        client_id = self.request.query_params.get('client_id', None)
        if client_id:
            queryset = queryset.filter(id_client=client_id)
        return queryset

    def perform_create(self, serializer):
        from django.utils import timezone
        import uuid
        serializer.save(
            id_tache=str(uuid.uuid4()),
            date_debut=timezone.now()  # Date de début = date de création
        )
