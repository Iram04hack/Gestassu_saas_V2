"""
Views pour le module Finances
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Mouvement, TypeMouvementManuel, TypeMouvementAutomatique, Caisse, Quittance
from .serializers import MouvementSerializer, TypeMouvementSerializer, CaisseSerializer, QuittanceSerializer
from reversement.models import Reversement, ReversementReglement


class MouvementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les mouvements financiers
    """
    queryset = Mouvement.objects.filter(effacer=False)
    serializer_class = MouvementSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['idtransfert', 'nature_compte', 'id_type_mvt', 'id_caisse', 'idquittance']
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

        # Filtre par client (IDCaisse = ID_Client) et nature_compte='CLIENT'
        client_id = self.request.query_params.get('client_id', None)
        if client_id:
            queryset = queryset.filter(id_caisse=client_id, nature_compte='CLIENT')

        # Filtre par période (standard Mouvement)
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)

        if date_debut:
            queryset = queryset.filter(datemouvement__date__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(datemouvement__date__lte=date_fin)

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

    def create(self, request, *args, **kwargs):
        from django.db.models import Sum

        data = request.data
        nature_compte = data.get('nature_compte', '')
        id_caisse     = data.get('IDCaisse') or data.get('id_caisse')
        mont_debit    = float(data.get('mont_debit', 0) or 0)
        mont_credit   = float(data.get('mont_credit', 0) or 0)

        # ── 1. Contrôle solde compte CLIENT pour tout débit ───────────
        if nature_compte == 'CLIENT' and id_caisse and mont_debit > 0:
            agg = Mouvement.objects.filter(
                id_caisse=id_caisse, nature_compte='CLIENT', effacer=False
            ).aggregate(
                total_credit=Sum('mont_credit'),
                total_debit=Sum('mont_debit'),
            )
            solde = float(agg['total_credit'] or 0) - float(agg['total_debit'] or 0)
            if mont_debit > solde:
                # Résoudre le nom du client pour un message clair
                nom_client = id_caisse
                try:
                    from django.apps import apps
                    Client = apps.get_model('crm', 'Client')
                    c = Client.objects.filter(id_client=id_caisse).first()
                    if c:
                        nom_client = f"{c.prenom_client or ''} {c.nom_client or ''}".strip() or id_caisse
                except Exception:
                    pass
                fmt = lambda n: f"{int(n):,}".replace(',', ' ')
                return Response(
                    {
                        'error': (
                            f"Solde insuffisant pour le compte de {nom_client}. "
                            f"Solde disponible\u00a0: {fmt(solde)}\u00a0XAF — "
                            f"Montant demandé\u00a0: {fmt(mont_debit)}\u00a0XAF."
                        )
                    },
                    status=400
                )

        # ── 2. Contrôle de conformité quittance ───────────────────────
        idquittance = data.get('idquittance')
        if idquittance:
            quittance = Quittance.objects.filter(
                idquittance=idquittance, effacer=False
            ).first()
            if quittance:
                if quittance.etat_quittance == -1:
                    return Response(
                        {'error': 'Cette quittance est annulée. Aucun règlement ne peut être enregistré.'},
                        status=400
                    )
                if quittance.etat_quittance == 1:
                    return Response(
                        {'error': 'Cette quittance est déjà soldée.'},
                        status=400
                    )
                deja_encaisse = Mouvement.objects.filter(
                    idquittance=idquittance, effacer=False
                ).aggregate(t=Sum('mont_debit'))['t'] or 0
                reste = float(quittance.prime_totale or 0) - float(deja_encaisse)
                if mont_debit > reste:
                    fmt = lambda n: f"{int(n):,}".replace(',', ' ')
                    return Response(
                        {
                            'error': (
                                f"Le montant saisi ({fmt(mont_debit)}\u00a0XAF) dépasse le reste à payer "
                                f"({fmt(reste)}\u00a0XAF) pour la quittance N°{quittance.numquittance}."
                            )
                        },
                        status=400
                    )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        import uuid
        from django.utils import timezone
        from django.db.models import Sum

        mouvement = serializer.save(
            idmouvement=f"MVT{str(uuid.uuid4().hex[:12]).upper()}",
            date_enreg_mvt=timezone.now(),
            solde_caisse=0,
        )

        # Solder automatiquement la quittance si total encaissé >= prime
        if mouvement.idquittance:
            try:
                quittance = Quittance.objects.filter(
                    idquittance=mouvement.idquittance, effacer=False
                ).first()
                if quittance and quittance.etat_quittance == 0:
                    total_encaisse = Mouvement.objects.filter(
                        idquittance=mouvement.idquittance, effacer=False
                    ).aggregate(total=Sum('mont_debit'))['total'] or 0
                    if float(total_encaisse) >= float(quittance.prime_totale or 0):
                        quittance.etat_quittance = 1
                        quittance.save(update_fields=['etat_quittance'])
            except Exception:
                pass



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


class QuittanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les quittances.
    etat_quittance en DB : -1=Annulée, 0=En attente, 1=Soldée
    Tabs frontend       :  '2'=Annulée, '0'=En attente, '1'=Soldée
    """
    queryset = Quittance.objects.filter(effacer=False)
    serializer_class = QuittanceSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date_enreg', 'numquittance', 'prime_totale']
    ordering = ['-date_enreg']

    def get_queryset(self):
        qs = Quittance.objects.filter(effacer=False)

        # Mapping tab frontend → valeur DB
        # tab '0'=En attente → db 0 | tab '1'=Soldée → db 1 | tab '2'=Annulée → db -1
        etat = self.request.query_params.get('etat_quittance')
        if etat == '2':
            qs = qs.filter(etat_quittance=-1)
        elif etat == '1':
            qs = qs.filter(etat_quittance=1)
        elif etat == '0':
            qs = qs.filter(etat_quittance=0)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(numquittance__icontains=search) | Q(id_contrat__icontains=search))

        date_du = self.request.query_params.get('date_du')
        date_au = self.request.query_params.get('date_au')
        if date_du:
            qs = qs.filter(date_enreg__date__gte=date_du)
        if date_au:
            qs = qs.filter(date_enreg__date__lte=date_au)
        return qs

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        items = page if page is not None else list(qs)

        # Batch-load contrats pour éviter N+1
        from django.apps import apps
        Contrat = apps.get_model('contrats', 'Contrat')
        contrat_ids = list({q.id_contrat for q in items if q.id_contrat})
        contrats_map = {}
        if contrat_ids:
            try:
                for c in Contrat.objects.select_related('produit', 'compagnie').filter(id_contrat__in=contrat_ids):
                    contrats_map[c.id_contrat] = c
            except Exception as e:
                print(f"Warning batch Contrat: {e}")

        serializer = self.get_serializer(items, many=True, context={
            'request': request,
            'contrats_map': contrats_map,
        })
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """GET /quittances/{id}/ — retourne la quittance avec contrats_map pour le serializer."""
        instance = self.get_object()
        from django.apps import apps
        Contrat = apps.get_model('contrats', 'Contrat')
        contrats_map = {}
        if instance.id_contrat:
            try:
                c = Contrat.objects.select_related('produit', 'compagnie').filter(id_contrat=instance.id_contrat).first()
                if c:
                    contrats_map[c.id_contrat] = c
            except Exception:
                pass
        serializer = self.get_serializer(instance, context={
            'request': request,
            'contrats_map': contrats_map,
        })
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='generer')
    def generer(self, request):
        """
        Génère une quittance pour un contrat en statut projet.
        Body: { id_contrat: str, observation?: str, idutilisateur?: str }
        """
        import uuid
        from django.utils import timezone
        from django.apps import apps

        id_contrat = request.data.get('id_contrat')
        if not id_contrat:
            return Response({'error': 'id_contrat est requis.'}, status=400)

        Contrat = apps.get_model('contrats', 'Contrat')
        try:
            contrat = Contrat.objects.get(id_contrat=id_contrat)
        except Contrat.DoesNotExist:
            return Response({'error': 'Contrat introuvable.'}, status=404)

        # Vérifier qu'il n'existe pas déjà une quittance active (non annulée)
        existing = Quittance.objects.filter(
            id_contrat=id_contrat, effacer=False
        ).exclude(etat_quittance=-1).first()
        if existing:
            return Response({'error': 'Une quittance active existe déjà pour ce contrat.'}, status=400)

        # Numéro quittance séquentiel
        from django.db.models import Max
        max_num = Quittance.objects.filter(effacer=False).aggregate(m=Max('numquittance'))['m']
        try:
            next_num = int(max_num or 0) + 1 if max_num and int(max_num) >= 10001 else 10001
        except (ValueError, TypeError):
            next_num = 10001

        now = timezone.now()
        prime = contrat.prime_totale or 0

        # Utilisateur courant (issu du JWT)
        user_id = getattr(request.user, 'idutilisateur', None) or request.data.get('idutilisateur', '')

        # Générer le numéro de police selon la règle :
        # {numero_agence}-{codification_compagnie}-{codification_produit}-{séquence}
        # Exemple : 001-204-428-10001
        # Séquence = MAX existant pour cette racine exacte + 1 (démarre à 10001 si aucun)
        if not contrat.numPolice:
            # Récupérer les codes depuis les FK du contrat
            code_agence = ''
            code_comp = ''
            code_prod = ''
            try:
                Agence = apps.get_model('core', 'Agence')
                agence = Agence.objects.filter(codeagence=contrat.CodeAgence).first()
                if agence:
                    code_agence = (agence.numero_agence or '').strip().upper()
            except Exception:
                pass
            try:
                if contrat.compagnie:
                    code_comp = (contrat.compagnie.codification_compagnie or '').strip().upper()
            except Exception:
                pass
            try:
                if contrat.produit:
                    code_prod = (contrat.produit.codification_produit or '').strip().upper()
            except Exception:
                pass

            racine = f"{code_agence}-{code_comp}-{code_prod}-"

            # Requête SQL exacte du référentiel §2.4 :
            # MAX( CAST( SUBSTRING(numPolice, LENGTH(racine)+1) AS UNSIGNED ) )
            # WHERE numPolice LIKE 'racine%'
            # Le filtre LIKE est complété par un test d'égalité de préfixe exact en Python
            # pour éviter que '001-1-' matche '001-10-' (startswith insuffisant).
            from django.db import connection
            racine_len = len(racine)
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT MAX(CAST(SUBSTRING(numPolice, %s) AS UNSIGNED)) "
                    "FROM contrat "
                    "WHERE LEFT(numPolice, %s) = %s",
                    [racine_len + 1, racine_len, racine]
                )
                row = cursor.fetchone()
                max_seq = int(row[0]) if row and row[0] else 0

            # Démarre à 10001 si aucun contrat existant pour cette racine
            next_seq = max(max_seq, 10000) + 1
            contrat.numPolice = f"{racine}{next_seq}"

        quittance = Quittance.objects.create(
            idquittance=str(uuid.uuid4())[:50],
            id_contrat=id_contrat,
            numquittance=str(next_num),
            prime_totale=prime,
            etat_quittance=0,
            prime_reverse=False,
            est_regle_chez_assureur=False,
            observation_quittance=request.data.get('observation', ''),
            idutilisateur=user_id,
            effacer=False,
            sync=False,
            date_enreg=now,
        )

        # Passer le contrat de projet → contrat (+ sauvegarder le numPolice généré)
        contrat.estprojet = False
        contrat.save(update_fields=['estprojet', 'numPolice'])

        serializer = self.get_serializer(quittance, context={
            'request': request,
            'contrats_map': {id_contrat: contrat},
        })
        return Response(serializer.data, status=201)

    def perform_destroy(self, instance):
        """Soft delete : met effacer=True au lieu de supprimer."""
        instance.effacer = True
        instance.save(update_fields=['effacer'])

    @action(detail=True, methods=['post'], url_path='annuler')
    def annuler(self, request, pk=None):
        """Annule une quittance (etat_quittance → -1)."""
        from django.utils import timezone
        quittance = self.get_object()
        if quittance.etat_quittance == -1:
            return Response({'error': 'Cette quittance est déjà annulée.'}, status=400)
        quittance.etat_quittance = -1
        quittance.date_annulation = timezone.now()
        quittance.annuler_par = request.data.get('annuler_par', '')
        quittance.save(update_fields=['etat_quittance', 'date_annulation', 'annuler_par'])
        return Response({'message': 'Quittance annulée avec succès.'})

    @action(detail=True, methods=['post'], url_path='solder')
    def solder(self, request, pk=None):
        """Solde une quittance (etat_quittance → 1)."""
        quittance = self.get_object()
        if quittance.etat_quittance == -1:
            return Response({'error': 'Impossible de solder une quittance annulée.'}, status=400)
        if quittance.etat_quittance == 1:
            return Response({'error': 'Cette quittance est déjà soldée.'}, status=400)
        quittance.etat_quittance = 1
        quittance.save(update_fields=['etat_quittance'])
        return Response({'message': 'Quittance soldée avec succès.'})
