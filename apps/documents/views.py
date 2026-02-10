"""
Views pour le module Documents
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les documents clients
    """
    queryset = Document.objects.filter(effacer=False)
    serializer_class = DocumentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['id_client']
    search_fields = ['titre_document']
    ordering_fields = ['date_enreg']
    ordering = ['-date_enreg']
    
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
            iddocuments=str(uuid.uuid4()),
            date_enreg=timezone.now()
        )
