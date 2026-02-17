"""
Views pour le module Finances
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Mouvement, TypeMouvementManuel, TypeMouvementAutomatique, Caisse
from .serializers import MouvementSerializer, TypeMouvementSerializer, CaisseSerializer
from reversement.models import Reversement, ReversementReglement
from rest_framework.response import Response


class MouvementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les mouvements financiers
    """
    queryset = Mouvement.objects.filter(effacer=False)
    serializer_class = MouvementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['idtransfert', 'nature_compte', 'id_type_mvt', 'id_caisse']
    search_fields = ['lib_type_mvt', 'observation']
    ordering_fields = ['datemouvement', 'date_enreg_mvt']
    ordering = ['-datemouvement']

    def list(self, request, *args, **kwargs):
        """
        Surcharge de list pour gérer le cas spécifique du compte courant COMPAGNIE
        qui doit lire dans la table REVERSEMENT et REVERSEMENT_REGLEMENT
        """
        # 1. Détection du cas "Compte Compagnie"
        id_compagnie = request.query_params.get('idtransfert')
        nature_compte = request.query_params.get('nature_compte')

        if nature_compte == 'COMPAGNIE' and id_compagnie:
            return self.list_compagnie_movements(request, id_compagnie)

        # 2. Cas standard
        return super().list(request, *args, **kwargs)

    def list_compagnie_movements(self, request, id_compagnie):
        """
        Logique spécifique pour récupérer les mouvements depuis REVERSEMENT
        """
        # Récupération des reversements (qui agissent comme des CRÉDITS/Dettes envers la compagnie)
        reversements = Reversement.objects.filter(
            id_compagnie=id_compagnie,
            effacer=False
        ).order_by('-datereversement')

        # Filtres de date
        start_date = request.query_params.get('datemouvement_after') or request.query_params.get('date_debut')
        end_date = request.query_params.get('datemouvement_before') or request.query_params.get('date_fin')
        
        if start_date:
            reversements = reversements.filter(datereversement__gte=start_date)
        if end_date:
            reversements = reversements.filter(datereversement__lte=end_date)

        mouvements_data = []

        for rev in reversements:
            # A. Le reversement (Crédit/Dette)
            # On utilise le libellé existant ou une valeur par défaut
            libelle = rev.lib_reversement 
            if not libelle or libelle.strip() == "":
                libelle = "Reversement de prime"

            mouvements_data.append({
                'idmouvement': rev.idgroupereversement,
                'datemouvement': rev.datereversement,
                'LibType_Mouvement': libelle,
                'mont_credit': rev.montant_reverse_total, # C'est ce qu'on doit à la compagnie
                'mont_debit': 0,
                'nature_compte': 'COMPAGNIE',
                'idtransfert': rev.id_compagnie,
                'observation': f"Période: {rev.periode_rev or 'N/A'}",
                'num_MVT': rev.num_ordre_rev,
                # Champs techniques pour le front
                'debit': 0,
                'credit': float(rev.montant_reverse_total or 0)
            })

            # B. Les règlements (Débit/Paiement)
            # On cherche les règlements liés à ce reversement
            reglements = ReversementReglement.objects.filter(idgroupereversement=rev.idgroupereversement)
            
            for reg in reglements:
                # Vérifier si la date du règlement est dans la plage filtrée (optionnel mais mieux)
                date_reg = reg.date_regle or rev.datereversement
                
                # Si filtres actifs, on vérifie sommairement (attention aux types de date)
                # Simplification: on inclut tout, le front filtrera ou on affine ici plus tard
                
                mouvements_data.append({
                    'idmouvement': reg.idregle_rev,
                    'datemouvement': date_reg,
                    'LibType_Mouvement': "Règlement de reversement",
                    'mont_credit': 0,
                    'mont_debit': reg.montant_regle, # C'est ce qu'on paie
                    'nature_compte': 'COMPAGNIE',
                    'idtransfert': rev.id_compagnie,
                    'observation': f"Réf: {reg.ref_reglement or 'N/A'} - Mode: {reg.mode_reglement or 'N/A'}",
                    'num_MVT': 0,
                    # Champs techniques
                    'debit': float(reg.montant_regle or 0),
                    'credit': 0
                })

        # Tri global par date décroissante
        # Gestion des None dates pour éviter crash
        mouvements_data.sort(key=lambda x: str(x['datemouvement'] or ""), reverse=True)

        return Response(mouvements_data)
    
    def get_queryset(self):
        """
        Filtrage personnalisé
        """
        queryset = super().get_queryset()
        
        # Filtre par client (idtransfert) et nature_compte='CLIENT'
        client_id = self.request.query_params.get('client_id', None)
        if client_id:
            queryset = queryset.filter(idtransfert=client_id)
            
        # Filtre par période (standard Mouvement)
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        
        if date_debut:
            queryset = queryset.filter(datemouvement__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(datemouvement__lte=date_fin)
            
        return queryset

    @action(detail=False, methods=['get'])
    def types(self, request):
        """
        Retourne les types de mouvements automatiques
        """
        types = TypeMouvementAutomatique.objects.filter(effacer=False)
        serializer = TypeMouvementSerializer(types, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def caisses(self, request):
        """
        Retourne les caisses disponibles
        """
        caisses = Caisse.objects.filter(effacer=False)
        serializer = CaisseSerializer(caisses, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        from django.utils import timezone
        serializer.save(date_enreg_mvt=timezone.now(), solde_caisse="0") # Placeholder pour solde caisse



class TypeMouvementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les types de mouvements automatiques
    """
    permission_classes = [IsAuthenticated]
    queryset = TypeMouvementAutomatique.objects.filter(effacer=False)
    serializer_class = TypeMouvementSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['lib_type_mouvement', 'id_type_mvt']
    ordering_fields = ['lib_type_mouvement']
    ordering = ['lib_type_mouvement']
    
    def perform_create(self, serializer):
        # Génération ID automatique
        import uuid
        generated_id = f"TMVT{str(uuid.uuid4().hex[:6]).upper()}"
        serializer.save(id_type_mvt=generated_id)

    def perform_destroy(self, instance):
        # Soft delete
        instance.effacer = True
        instance.save()


class CaisseViewSet(viewsets.ModelViewSet):
    queryset = Caisse.objects.filter(effacer=False)
    serializer_class = CaisseSerializer
