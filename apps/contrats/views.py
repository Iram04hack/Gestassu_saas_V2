"""
Views pour le module Contrats
"""
import uuid
import traceback as tb
from io import BytesIO

from django.utils import timezone
from django.db.models import Q
from django.apps import apps

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Contrat, Risques, ContratRisques
from .serializers import ContratSerializer, ContratListSerializer, RisqueSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200


_ALLOWED_ORDERINGS = {
    'numPolice', '-numPolice',
    'numAvenant', '-numAvenant',
    'date_acte', '-date_acte',
    'date_effet', '-date_effet',
    'Date_echeance', '-Date_echeance',
    'prime_totale', '-prime_totale',
    'type_contrat', '-type_contrat',
    'date_enreg', '-date_enreg',
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _safe_str(v):
    """Retourne une chaîne propre ou None."""
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def _safe_int(v):
    """Convertit en entier ou retourne None."""
    try:
        return int(v) if v not in (None, '', 'None') else None
    except (ValueError, TypeError):
        return None


def _upsert_risque(veh_data):
    """
    Crée ou retourne un Risque existant pour le véhicule donné.
    - Si veh_immat est fourni et existe déjà (case-insensitive) → retourne l'existant sans modification
    - Sinon → crée un nouveau Risque et retourne son id_risque
    Retourne (id_risque, created: bool)
    """
    immat = _safe_str(veh_data.get('veh_immat'))
    if immat:
        immat = immat.upper()

    if immat:
        existing = Risques.objects.filter(veh_immat__iexact=immat, effacer=False).first()
        if existing:
            return existing.id_risque, False

    # Nouveau risque
    new_id = str(uuid.uuid4())
    Risques.objects.create(
        id_risque=new_id,
        type_risque='Véhicule',
        veh_immat=immat or None,
        veh_marque=_safe_str(veh_data.get('veh_marque')),
        veh_modele=_safe_str(veh_data.get('veh_modele')),
        veh_chassis=_safe_str(veh_data.get('veh_chassis')),
        veh_type=_safe_str(veh_data.get('veh_type')),
        veh_puissance=_safe_str(veh_data.get('veh_puissance')),
        veh_nbplace=_safe_int(veh_data.get('veh_nbplace')),
        veh_cat=_safe_str(veh_data.get('veh_cat')),
        veh_energie=_safe_str(veh_data.get('veh_energie')),
        veh_usage=_safe_str(veh_data.get('veh_usage')),
        veh_valeur_neuve=_safe_str(veh_data.get('veh_valeur_neuve')),
        veh_valeur_venale=_safe_str(veh_data.get('veh_valeur_venale')),
        veh_nbremorque=_safe_int(veh_data.get('veh_nbremorque')),
        effacer=False,
        sync=False,
        date_enreg=timezone.now(),
    )
    return new_id, True


# ─────────────────────────────────────────────────────────────────────────────


class ContratViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les contrats.
    La vue liste utilise ContratListSerializer (allégé, batch prefetch)
    pour minimiser les allers-retours DB sur un serveur distant.
    """
    queryset = Contrat.objects.all()
    serializer_class = ContratSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        try:
            queryset = Contrat.objects.filter(
                Q(effacer=False) | Q(effacer__isnull=True)
            ).select_related('produit', 'compagnie')
        except Exception:
            queryset = Contrat.objects.all()

        params = self.request.query_params

        # Filtre client
        id_client = params.get('ID_Client')
        if id_client:
            queryset = queryset.filter(ID_Client=id_client)

        # Filtre compagnie (via FK compagnie_id)
        id_compagnie = params.get('Id_compagnie')
        if id_compagnie:
            queryset = queryset.filter(compagnie_id=id_compagnie)

        # Filtre agence
        code_agence = params.get('CodeAgence')
        if code_agence:
            queryset = queryset.filter(CodeAgence=code_agence)

        # Filtre apporteur
        code_apporteur = params.get('code_apporteur')
        if code_apporteur:
            queryset = queryset.filter(code_apporteur=code_apporteur)

        # Filtre projet/contrat
        estprojet = params.get('estprojet')
        if estprojet is not None:
            queryset = queryset.filter(estprojet=(estprojet.lower() in ('true', '1')))

        # Filtre groupe produit — 2 requêtes séparées pour éviter le JOIN cross-app
        code_groupe_prod = params.get('code_groupe_prod')
        if code_groupe_prod:
            try:
                Produit = apps.get_model('produits', 'Produit')
                produit_ids = list(
                    Produit.objects.filter(
                        code_groupe_prod=code_groupe_prod
                    ).values_list('id_produit', flat=True)
                )
                if produit_ids:
                    queryset = queryset.filter(produit_id__in=produit_ids)
                else:
                    queryset = queryset.none()
            except Exception as e:
                print(f"Warning: code_groupe_prod filter skipped: {e}")

        # Filtre période date_effet
        date_effet_min = params.get('date_effet_min')
        if date_effet_min:
            queryset = queryset.filter(date_effet__gte=date_effet_min)

        date_effet_max = params.get('date_effet_max')
        if date_effet_max:
            queryset = queryset.filter(date_effet__lte=date_effet_max)

        # Recherche textuelle
        search = params.get('search')
        if search:
            # Recherche par N° police et aussi par nom/prénom client (sous-requête)
            client_ids_matching = []
            try:
                Client = apps.get_model('crm', 'Client')
                client_ids_matching = list(
                    Client.objects.filter(
                        Q(nom_client__icontains=search) | Q(prenom_client__icontains=search)
                    ).values_list('id_client', flat=True)
                )
            except Exception:
                pass
            queryset = queryset.filter(
                Q(numPolice__icontains=search) |
                Q(numPolice_assureur__icontains=search) |
                Q(ID_Client__in=client_ids_matching)
            )

        # Filtre statut (calculé depuis les booléens du modèle)
        statut = params.get('statut')
        if statut == 'actif':
            queryset = queryset.filter(estprojet=False, est_resilier=False, est_suspendu=False)
        elif statut == 'resilie':
            queryset = queryset.filter(est_resilier=True)
        elif statut == 'suspendu':
            queryset = queryset.filter(est_suspendu=True)
        elif statut == 'projet':
            queryset = queryset.filter(estprojet=True)

        # Tri (whitelist sécurisée)
        ordering = params.get('ordering', '-date_enreg')
        queryset = queryset.order_by(ordering if ordering in _ALLOWED_ORDERINGS else '-date_enreg')

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Override list() :
        - Batch-charge Client / Agence / Utilisateur en 3 requêtes fixes
        - Utilise ContratListSerializer (sans champ 'risques')
        - Inclut le traceback complet dans la réponse 500 pour débogage
        """
        try:
            # ── 1. Queryset + pagination ──────────────────────────────────────
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            items = page if page is not None else list(queryset)

            # ── 2. Batch load (chaque bloc protégé indépendamment) ────────────
            client_ids   = list({c.ID_Client         for c in items if c.ID_Client})
            agence_codes = list({c.CodeAgence         for c in items if c.CodeAgence})
            user_ids     = list({c.IDUTILISATEUR_save for c in items if c.IDUTILISATEUR_save})

            clients_map = {}
            agences_map = {}
            users_map   = {}

            if client_ids:
                try:
                    Client = apps.get_model('crm', 'Client')
                    for c in Client.objects.filter(id_client__in=client_ids):
                        clients_map[c.id_client] = c
                        clients_map[c.id_client.strip()] = c
                except Exception as e:
                    print(f"Warning batch Client: {e}")

            if agence_codes:
                try:
                    Agence = apps.get_model('core', 'Agence')
                    for a in Agence.objects.filter(codeagence__in=agence_codes):
                        agences_map[a.codeagence] = a
                except Exception as e:
                    print(f"Warning batch Agence: {e}")

            if user_ids:
                try:
                    Utilisateur = apps.get_model('authentication', 'Utilisateur')
                    for u in Utilisateur.objects.filter(idutilisateur__in=user_ids):
                        users_map[u.idutilisateur] = u
                except Exception as e:
                    print(f"Warning batch Utilisateur: {e}")

            # ── 3. Sérialisation ──────────────────────────────────────────────
            context = {
                **self.get_serializer_context(),
                'clients_map': clients_map,
                'agences_map': agences_map,
                'users_map':   users_map,
            }
            serializer = ContratListSerializer(items, many=True, context=context)

            if page is not None:
                return self.get_paginated_response(serializer.data)
            return Response(serializer.data)

        except Exception as e:
            trace = tb.format_exc()
            print(f"CRITICAL ERROR ContratViewSet.list: {e}\n{trace}")
            # Le traceback est inclus dans la réponse pour faciliter le débogage
            # (visible dans l'onglet Network du navigateur)
            return Response(
                {"error": str(e), "traceback": trace},
                status=500
            )

    def create(self, request, *args, **kwargs):
        """
        Création d'un contrat avec gestion des véhicules.
        Pour chaque véhicule :
          - Si veh_immat existe déjà en DB → utilise l'enregistrement existant (silencieux)
          - Sinon → crée un nouveau Risque
          - Crée ensuite le lien ContratRisques
        """
        try:
            data = request.data
            vehicules = data.get('vehicules', [])

            id_contrat = str(uuid.uuid4())

            # ── Utilisateur courant (issu du JWT) ─────────────────────────────
            user_id = None
            try:
                if request.user and request.user.is_authenticated:
                    user_id = str(request.user.idutilisateur)
            except Exception:
                pass

            # ── Création du Contrat ────────────────────────────────────────────
            Contrat.objects.create(
                id_contrat=id_contrat,
                estprojet=data.get('estprojet', False),
                numPolice=_safe_str(data.get('numPolice')),
                type_doc=_safe_str(data.get('type_doc')) or 'AFFAIRE NOUVELLE',
                type_contrat=_safe_str(data.get('type_contrat')) or 'Mono',
                nature_contrat=_safe_str(data.get('nature_contrat')),
                date_acte=data.get('date_acte') or None,
                date_effet=data.get('date_effet') or None,
                Date_echeance=data.get('Date_echeance') or None,
                duree_contrat=_safe_int(data.get('duree_contrat')),
                fractionnement=data.get('fractionnement') or None,
                ID_Client=_safe_str(data.get('ID_Client')),
                compagnie_id=_safe_str(data.get('Id_compagnie')),
                produit_id=_safe_str(data.get('Id_produit')),
                CodeAgence=_safe_str(data.get('CodeAgence')),
                code_apporteur=_safe_str(data.get('code_apporteur')),
                taux_com_apporteur=data.get('taux_com_apporteur') or None,
                commission_courtier=_safe_int(data.get('commission_courtier')),
                prime_nette_brute=_safe_int(data.get('prime_nette_brute')),
                montant_reductions=_safe_int(data.get('montant_reductions')),
                prime_net_red=_safe_int(data.get('prime_net_red')),
                accessoires=_safe_int(data.get('accessoires')),
                taxe=_safe_int(data.get('taxe')),
                CEMAC=_safe_int(data.get('CEMAC')),
                CSS=_safe_int(data.get('CSS')),
                TSVL=_safe_int(data.get('TSVL')),
                CCA=_safe_int(data.get('CCA')),
                prime_totale=_safe_int(data.get('prime_totale')),
                numAvenant=str(data.get('numAvenant', '0')),
                IDUTILISATEUR_save=user_id,
                effacer=False,
                sync=False,
                date_enreg=timezone.now(),
            )

            # ── Véhicules ─────────────────────────────────────────────────────
            for veh in vehicules:
                try:
                    risque_id, _ = _upsert_risque(veh)
                    ContratRisques.objects.update_or_create(
                        id_risque=risque_id,
                        defaults={'id_contrat': id_contrat, 'effacer': False},
                    )
                except Exception as veh_err:
                    # Échec silencieux par véhicule — le contrat est quand même créé
                    print(f"Warning: vehicle upsert failed: {veh_err}")

            return Response({'id_contrat': id_contrat}, status=201)

        except Exception as e:
            trace = tb.format_exc()
            print(f"CRITICAL ERROR ContratViewSet.create: {e}\n{trace}")
            return Response({'error': str(e), 'traceback': trace}, status=500)

    def perform_destroy(self, instance):
        """Soft delete : met effacer=True au lieu de supprimer physiquement."""
        instance.effacer = True
        instance.save(update_fields=['effacer'])

    @action(detail=True, methods=['patch'], url_path='update_police')
    def update_police(self, request, pk=None):
        """Met à jour le numéro de police assureur d'un contrat."""
        contrat = self.get_object()
        num = request.data.get('numPolice_assureur')
        if num is None:
            return Response({'error': 'numPolice_assureur est requis.'}, status=400)
        contrat.numPolice_assureur = str(num).strip() or None
        contrat.save(update_fields=['numPolice_assureur'])
        return Response({'numPolice_assureur': contrat.numPolice_assureur})


class RisquesViewSet(viewsets.ModelViewSet):
    """
    Endpoint pour la liste des véhicules (risques).
    Supporte la recherche, l'import depuis Excel et la mise à jour partielle (PATCH).
    Les actions create/destroy sont désactivées — passer par ContratViewSet.
    """
    serializer_class = RisqueSerializer
    pagination_class = StandardResultsSetPagination
    http_method_names = ['get', 'patch', 'head', 'options']

    def partial_update(self, request, *args, **kwargs):
        """
        Override PATCH : met à jour date_modif automatiquement.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Mise à jour de date_modif (table legacy sans auto_now)
        Risques.objects.filter(pk=instance.pk).update(date_modif=timezone.now())
        return Response(serializer.data)

    def get_queryset(self):
        qs = Risques.objects.filter(effacer=False).order_by('-date_enreg')
        params = self.request.query_params

        # Filtre par type de risque (véhicule par défaut)
        type_risque = params.get('type_risque')
        if type_risque:
            qs = qs.filter(type_risque__iexact=type_risque)

        # Recherche globale
        search = params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(veh_immat__icontains=search) |
                Q(veh_marque__icontains=search) |
                Q(veh_modele__icontains=search) |
                Q(veh_chassis__icontains=search) |
                Q(designation_risque__icontains=search)
            )
        return qs

    @action(detail=False, methods=['get'], url_path='choices')
    def choices(self, request):
        """
        Retourne les valeurs distinctes de veh_usage et veh_energie
        présentes dans la table risques (effacer=False).
        Utilisé par le frontend pour alimenter les menus déroulants.
        """
        usages = list(
            Risques.objects
            .filter(effacer=False)
            .exclude(veh_usage__isnull=True)
            .exclude(veh_usage='')
            .values_list('veh_usage', flat=True)
            .distinct()
            .order_by('veh_usage')
        )
        energies = list(
            Risques.objects
            .filter(effacer=False)
            .exclude(veh_energie__isnull=True)
            .exclude(veh_energie='')
            .values_list('veh_energie', flat=True)
            .distinct()
            .order_by('veh_energie')
        )
        # Valeurs par défaut si la table est vide
        if not usages:
            usages = ['Commercial', 'Personnel', 'Taxi', 'Transport en commun', 'Utilitaire']
        if not energies:
            energies = ['Diesel', 'Électrique', 'Essence', 'Hybride']
        return Response({'usages': usages, 'energies': energies})

    @action(
        detail=False,
        methods=['post'],
        url_path='import_excel',
        parser_classes=[MultiPartParser],
    )
    def import_excel(self, request):
        """
        Importe des véhicules depuis un fichier Excel (.xlsx / .xls).

        Colonnes attendues (ligne 1 = en-têtes) :
          veh_immat, veh_marque, veh_modele, veh_chassis, veh_type,
          veh_carrosserie, veh_puissance, veh_nbplace, veh_cat,
          veh_energie, veh_usage, veh_valeur_neuve, veh_valeur_venale,
          veh_nbremorque

        Règle doublon : si veh_immat existe déjà (insensible à la casse),
        la ligne est ignorée silencieusement.
        """
        import openpyxl

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier fourni.'}, status=400)

        try:
            wb = openpyxl.load_workbook(BytesIO(file.read()), read_only=True, data_only=True)
        except Exception as e:
            return Response({'error': f'Fichier Excel invalide : {e}'}, status=400)

        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))

        if len(rows) < 2:
            return Response({'created': [], 'skipped': [], 'errors': []})

        # Normalise les en-têtes : minuscule, sans espaces superflus
        headers = [
            str(h).strip().lower().replace(' ', '_') if h is not None else ''
            for h in rows[0]
        ]

        created = []
        skipped = []
        errors  = []

        for row_values in rows[1:]:
            row = dict(zip(headers, row_values))

            immat = _safe_str(row.get('veh_immat'))
            if not immat:
                continue  # ligne vide ou sans immat — ignorée
            immat = immat.upper()

            # Vérification doublon (insensible à la casse)
            if Risques.objects.filter(veh_immat__iexact=immat, effacer=False).exists():
                skipped.append(immat)
                continue

            try:
                Risques.objects.create(
                    id_risque=str(uuid.uuid4()),
                    type_risque='Véhicule',
                    veh_immat=immat,
                    veh_marque=_safe_str(row.get('veh_marque')),
                    veh_modele=_safe_str(row.get('veh_modele')),
                    veh_chassis=_safe_str(row.get('veh_chassis')),
                    veh_type=_safe_str(row.get('veh_type')),
                    veh_carrosserie=_safe_str(row.get('veh_carrosserie')),
                    veh_puissance=_safe_str(row.get('veh_puissance')),
                    veh_nbplace=_safe_int(row.get('veh_nbplace')),
                    veh_cat=_safe_str(row.get('veh_cat')),
                    veh_energie=_safe_str(row.get('veh_energie')),
                    veh_usage=_safe_str(row.get('veh_usage')),
                    veh_valeur_neuve=_safe_str(
                        row.get('veh_valeur_neuve') or row.get('veh_valeurneuve')
                    ),
                    veh_valeur_venale=_safe_str(
                        row.get('veh_valeur_venale') or row.get('veh_valeurvenale')
                    ),
                    veh_nbremorque=_safe_int(row.get('veh_nbremorque')),
                    effacer=False,
                    sync=False,
                    date_enreg=timezone.now(),
                )
                created.append(immat)
            except Exception as e:
                errors.append({'immat': immat, 'error': str(e)})

        return Response({
            'created': created,
            'skipped': skipped,
            'errors':  errors,
        })
