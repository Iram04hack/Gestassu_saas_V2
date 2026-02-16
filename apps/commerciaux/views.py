from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Apporteur, CommissionApporteur
from .serializers import ApporteurSerializer, CommissionApporteurSerializer

class ApporteurViewSet(viewsets.ModelViewSet):
    """
    API pour gérer les commerciaux et apporteurs d'affaires
    """
    permission_classes = [IsAuthenticated]
    queryset = Apporteur.objects.filter(effacer=False)
    serializer_class = ApporteurSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom_apporteur', 'code_apporteur', 'adresse']
    ordering_fields = ['nom_apporteur', 'date_enreg']
    filterset_fields = ['type_apporteur']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtre spécifique pour Particuliers vs Entreprises si besoin
        # Le frontend enverra ?search=... ou filtrera côté client sur type_apporteur
        return queryset

    def perform_destroy(self, instance):
        instance.effacer = True
        instance.save()


class CommissionApporteurViewSet(viewsets.ModelViewSet):
    """
    API pour gérer les commissions des apporteurs
    """
    permission_classes = [IsAuthenticated]
    queryset = CommissionApporteur.objects.filter(effacer=False)
    serializer_class = CommissionApporteurSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['code_apporteur']

    def perform_destroy(self, instance):
        instance.effacer = True
        instance.save()

