"""
Views pour le module Tarifs
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import TarifAuto, TarifMRH
from .serializers import TarifAutoSerializer, TarifMRHSerializer


class TarifPagination(PageNumberPagination):
    """Pagination optimisée pour les tarifs"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class TarifAutoViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tarifs automobile.
    Optimisé avec pagination et cache.
    """
    serializer_class = TarifAutoSerializer
    pagination_class = TarifPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    def get_queryset(self):
        """Optimise les requêtes en limitant les champs"""
        return TarifAuto.objects.filter(effacer=False).only(
            'idtarif', 'id_compagnie', 'id_produit', 'groupe', 'code_cat',
            'energie', 'id_garantie', 'puissance_fiscale', 'valeur_vehicule',
            'prime_fixe', 'prime_taux', 'prime_minimun', 'capital',
            'prime_taux_sur', 'prime_taux_garantie',
            'surprime_passager', 'surprime_remorque',
            'franchise_fixe', 'taux_franchise', 'franchise_min', 'franchise_max'
        )

    # Filtres
    filterset_fields = [
        'id_compagnie',
        'id_produit',
        'code_cat',
        'groupe',
        'energie',
        'id_garantie'
    ]

    # Recherche
    search_fields = [
        'idtarif',
        'groupe',
        'code_cat'
    ]

    # Tri
    ordering_fields = ['id_compagnie', 'groupe', 'code_cat', 'puissance_fiscale']
    ordering = ['id_compagnie', 'groupe', 'code_cat']

    def list(self, request, *args, **kwargs):
        """Override list to catch and log errors properly"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='calculer_primes')
    def calculer_primes(self, request):
        """
        Calcule les primes pour chaque véhicule × garantie selon calcul_prime_tout().

        Body JSON attendu :
        {
            "id_compagnie": "CMP01",
            "id_produit": "PRD01",
            "est_entreprise": false,
            "fractionnement": 1.0,
            "vehicules": [
                {
                    "veh_idx": 0,
                    "cat": "A1",
                    "energie": "Essence",
                    "puissance_fiscale": 7,
                    "valeur_venale": 5000000,
                    "valeur_neuve": 6000000,
                    "nbplace": 5,
                    "nbremorque": 0,
                    "garanties": [
                        {
                            "id_garantie": "G001",
                            "inclus_pf": false,
                            "inclus_vv": false,
                            "inclus_surprime": false
                        }
                    ]
                }
            ]
        }

        Retourne :
        {
            "vehicules": [
                {
                    "veh_idx": 0,
                    "garanties": [
                        {
                            "id_garantie": "G001",
                            "prime_annuelle": 15000,
                            "franchise": 50000,
                            "capital": 0,
                            "prime_periode": 15000,
                            "tarif_trouve": true
                        }
                    ]
                }
            ]
        }
        """
        data = request.data
        id_compagnie = data.get('id_compagnie', '')
        id_produit = data.get('id_produit', '')
        est_entreprise = data.get('est_entreprise', False)
        fractionnement = float(data.get('fractionnement', 1.0))
        vehicules_input = data.get('vehicules', [])

        groupe = 'Groupe B' if est_entreprise else 'Groupe A'

        result_vehicules = []
        debug_mismatches = []  # Pour aider au diagnostic

        for veh in vehicules_input:
            veh_idx = veh.get('veh_idx', 0)
            cat = veh.get('cat', '')
            energie = veh.get('energie', '')
            pf = int(veh.get('puissance_fiscale', 0) or 0)
            valeur_venale = float(veh.get('valeur_venale', 0) or 0)
            valeur_neuve = float(veh.get('valeur_neuve', 0) or 0)
            nbplace = int(veh.get('nbplace', 0) or 0)
            nbremorque = int(veh.get('nbremorque', 0) or 0)
            garanties_input = veh.get('garanties', [])

            # Stocke les primes déjà calculées (mode "Autres garantie")
            primes_par_garantie = {}

            result_garanties = []

            for gar in garanties_input:
                id_garantie = gar.get('id_garantie', '')
                inclus_pf = gar.get('inclus_pf', False)
                inclus_vv = gar.get('inclus_vv', False)
                inclus_surprime = gar.get('inclus_surprime', False)

                # ── Recherche tarifaire (clé composite) ──────────────────────
                #
                # La BD tarif_auto ne stocke pas toutes les PF exhaustivement.
                # Elle stocke des PF représentatives définissant des tranches.
                # L'ancienne interface WinDev utilise la tranche inférieure (PF
                # stockée la plus haute ≤ PF du véhicule).
                #
                # Ordre de priorité :
                #  1. PF exacte                   (correspondance parfaite)
                #  2. Tranche inférieure (pf ≤ X)  (comportement WinDev)
                #  3. Tranche supérieure (pf ≥ X)  (dernier recours, PF min de la table)
                #
                # • inclus_pf=False → PAS de filtre sur puissance_fiscale du tout
                # • inclus_vv=False → filtre valeur_vehicule=0
                # • inclus_vv=True  → PAS de filtre sur valeur_vehicule

                base_filters = dict(
                    effacer=False,
                    id_produit=id_produit,
                    id_compagnie=id_compagnie,
                    groupe=groupe,
                    code_cat=cat,
                    energie=energie,
                    id_garantie=id_garantie,
                )
                if not inclus_vv:
                    base_filters['valeur_vehicule'] = 0

                if not inclus_pf:
                    # Pas de contrainte PF — prendre la ligne la plus ancienne (comportement WinDev)
                    tarif = TarifAuto.objects.filter(**base_filters).order_by('date_modif').first()
                else:
                    # 1. PF exacte — prendre la ligne la plus ancienne en cas de doublons
                    tarif = TarifAuto.objects.filter(**base_filters, puissance_fiscale=pf).order_by('date_modif').first()
                    if tarif is None:
                        # 2. Tranche inférieure : max(PF_BD) ≤ pf véhicule
                        tarif = TarifAuto.objects.filter(
                            **base_filters, puissance_fiscale__lte=pf
                        ).order_by('-puissance_fiscale', 'date_modif').first()
                    if tarif is None:
                        # 3. Tranche supérieure : min(PF_BD) ≥ pf véhicule
                        tarif = TarifAuto.objects.filter(
                            **base_filters, puissance_fiscale__gte=pf
                        ).order_by('puissance_fiscale', 'date_modif').first()

                if tarif is None:
                    debug_mismatches.append({
                        'veh_idx': veh_idx,
                        'id_garantie': id_garantie,
                        'clé_envoyée': {
                            'groupe': groupe, 'code_cat': cat, 'energie': energie,
                            'puissance_fiscale': pf if inclus_pf else '(ignoré)',
                            'valeur_vehicule': 0 if not inclus_vv else '(ignoré)',
                        },
                    })
                    result_garanties.append({
                        'id_garantie': id_garantie,
                        'prime_annuelle': 0,
                        'franchise': 0,
                        'capital': 0,
                        'prime_periode': 0,
                        'tarif_trouve': False,
                    })
                    primes_par_garantie[id_garantie] = 0
                    continue

                # ── §5 : Calcul prime de base ────────────────────────────
                prime_fixe = float(tarif.prime_fixe or 0)
                prime_taux = float(tarif.prime_taux or 0)
                prime_taux_sur = (tarif.prime_taux_sur or '').strip().lower()
                prime_taux_garantie_ref = (tarif.prime_taux_garantie or '').strip()

                if prime_fixe > 0:
                    nPrime = prime_fixe
                else:
                    if prime_taux_sur in ('valeur vénale', 'valeur venale', 'valeur_venale',
                                          'valeur v\u00e9nale'):
                        base = valeur_venale
                    elif prime_taux_sur in ('valeur neuve', 'valeur_neuve'):
                        base = valeur_neuve
                    elif prime_taux_sur in ('autres garantie', 'autres_garantie',
                                            'autre garantie', 'autres garanties'):
                        base = primes_par_garantie.get(prime_taux_garantie_ref, 0)
                    else:
                        base = 0
                    nPrime = prime_taux * base

                # ── §6 : Surprimes ───────────────────────────────────────
                surprime_passager = float(tarif.surprime_passager or 0)
                surprime_remorque = float(tarif.surprime_remorque or 0)

                if inclus_surprime and surprime_passager > 0 and valeur_venale > 0:
                    # Surprime valeur vénale : utilise le taux surprime_passager
                    nPrime = nPrime * (1 + surprime_passager)
                elif surprime_passager > 0 and nbplace > 0:
                    # Surprime passagers ordinaire
                    nPrime = nPrime * (1 + nbplace * surprime_passager)

                if surprime_remorque > 0 and nbremorque > 0:
                    nPrime = nPrime * (1 + nbremorque * surprime_remorque)

                # ── §7 : Minimum de prime ────────────────────────────────
                prime_minimun = float(tarif.prime_minimun or 0)
                if prime_minimun > 0 and nPrime < prime_minimun:
                    nPrime = prime_minimun

                nPrime = round(nPrime)

                # ── §8 : Franchise ───────────────────────────────────────
                franchise_fixe = float(tarif.franchise_fixe or 0)
                taux_franchise = float(tarif.taux_franchise or 0)
                franchise_min = float(tarif.franchise_min or 0)
                franchise_max = float(tarif.franchise_max or 0)

                if franchise_fixe > 0:
                    nFranchise = franchise_fixe
                else:
                    base_fr = valeur_venale if (inclus_vv and valeur_venale > 0) else valeur_neuve
                    nFranchise = taux_franchise * base_fr

                if franchise_min > 0 and nFranchise < franchise_min:
                    nFranchise = franchise_min
                if franchise_max > 0 and nFranchise > franchise_max:
                    nFranchise = franchise_max

                nFranchise = round(nFranchise)

                # ── §9 : Prime de période ────────────────────────────────
                nPrimePeriode = round(nPrime * fractionnement)

                capital = int(tarif.capital or 0)
                primes_par_garantie[id_garantie] = nPrime

                result_garanties.append({
                    'id_garantie': id_garantie,
                    'prime_annuelle': nPrime,
                    'franchise': nFranchise,
                    'capital': capital,
                    'prime_periode': nPrimePeriode,
                    'tarif_trouve': True,
                })

            result_vehicules.append({
                'veh_idx': veh_idx,
                'garanties': result_garanties,
            })

        response_data = {'vehicules': result_vehicules}
        if debug_mismatches:
            # Limiter à 5 entrées uniques pour ne pas surcharger la réponse
            unique = {m['id_garantie']: m for m in debug_mismatches}
            response_data['debug_non_trouvees'] = list(unique.values())[:5]
        return Response(response_data, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        """Soft delete"""
        instance.effacer = True
        instance.save()


class TarifMRHViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tarifs Multirisque Habitation
    Optimisé avec pagination et cache
    """
    serializer_class = TarifMRHSerializer
    pagination_class = TarifPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    lookup_field = 'idtarif_mrh'

    def get_queryset(self):
        """Retourne tous les tarifs MRH non supprimés"""
        return TarifMRH.objects.filter(effacer=False)

    # Filtres
    filterset_fields = [
        'idcompagnie',
        'id_produit',
        'id_garantie'
    ]

    # Recherche
    search_fields = [
        'idtarif_mrh',
        'id_garantie'
    ]

    # Tri
    ordering_fields = ['idcompagnie', 'id_produit', 'id_garantie']
    ordering = ['idcompagnie', 'id_produit']

    def list(self, request, *args, **kwargs):
        """Override list to catch and log errors properly"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_destroy(self, instance):
        """Soft delete"""
        instance.effacer = True
        instance.save()
