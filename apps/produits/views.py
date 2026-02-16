"""
Views pour le module Produits
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import Produit, GroupeProduit, CatVehicule, CommissionCategorie, Attestation
from .serializers import (
    ProduitSerializer, GroupeProduitSerializer, CatVehiculeSerializer, 
    CommissionCategorieSerializer, AttestationSerializer, 
    AttestationBulkCreateSerializer, AttestationStatsSerializer
)


class GroupeProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les groupes de produits
    """
    queryset = GroupeProduit.objects.filter(effacer=False)
    serializer_class = GroupeProduitSerializer
    permission_classes = []  # Accessible à tous les utilisateurs authentifiés par défaut
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['lib_groupe_prod']
    ordering_fields = ['lib_groupe_prod']
    ordering = ['lib_groupe_prod']
    
class ProduitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les produits
    """
    queryset = Produit.objects.filter(effacer=False)
    serializer_class = ProduitSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['Id_compagnie', 'code_groupe_prod', 'branche']
    search_fields = ['lib_produit', 'codification_produit']
    ordering_fields = ['lib_produit']
    ordering = ['lib_produit']


class CatVehiculeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories de véhicules
    """
    queryset = CatVehicule.objects.filter(effacer=False)
    serializer_class = CatVehiculeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['enable_flotte', 'sync']
    search_fields = ['lib_cat', 'code_cat']
    ordering_fields = ['lib_cat']
    ordering = ['lib_cat']

    ordering = ['lib_cat']

    def perform_destroy(self, instance):
        """
        Soft delete: Marquer comme effacé au lieu de supprimer physiquement
        """
        instance.effacer = True
        instance.save()


class CommissionCategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les commissions par catégorie
    """
    queryset = CommissionCategorie.objects.filter(effacer=False)
    serializer_class = CommissionCategorieSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['code_cat', 'id_compagnie']
    search_fields = ['code_cat', 'id_compagnie']
    ordering_fields = ['code_cat', 'id_compagnie']
    ordering = ['code_cat']

    ordering = ['code_cat']
    
    def create(self, request, *args, **kwargs):
        """
        Custom create to handle Upsert (Update if exists, else Create)
        Based on composite key (code_cat + id_compagnie)
        """
        code_cat = request.data.get('code_cat')
        id_compagnie = request.data.get('id_compagnie')
        
        if not code_cat or not id_compagnie:
            from rest_framework.response import Response
            from rest_framework import status
            return Response(
                {"error": "code_cat and id_compagnie are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if exists (including soft deleted ones? No, if soft deleted, we resurrect or update?)
        # Let's say if exists, we update.
        instance = CommissionCategorie.objects.filter(
            code_cat=code_cat, 
            id_compagnie=id_compagnie
        ).first()
        
        if instance:
            # Update
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            # Ensure resurrected if it was deleted
            if instance.effacer:
                serializer.save(effacer=False)
            else:
                serializer.save()
                
            return Response(serializer.data)
        else:
            # Create
            return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def delete_custom(self, request):
        """
        Custom delete using composite key in body
        """
        code_cat = request.data.get('code_cat')
        id_compagnie = request.data.get('id_compagnie')
        
        if not code_cat or not id_compagnie:
             from rest_framework.response import Response
             from rest_framework import status
             return Response(
                {"error": "code_cat and id_compagnie are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        instance = CommissionCategorie.objects.filter(
            code_cat=code_cat, 
            id_compagnie=id_compagnie
        ).first()
        
        if instance:
            instance.effacer = True
            instance.save()
            return Response({"status": "deleted"})
        else:
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def perform_destroy(self, instance):
        """Soft delete (Standard ID)"""
        instance.effacer = True
        instance.save()


class AttestationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les attestations automobiles
    """
    queryset = Attestation.objects.all()
    serializer_class = AttestationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['Etat_attestation', 'id_compagnie', 'CodeAgence', 'ref_lot']
    search_fields = ['Num_attestation', 'ref_lot', 'id_attestation']
    ordering_fields = ['date_enreg', 'Num_attestation']
    ordering = ['-date_enreg']

    def get_queryset(self):
        queryset = super().get_queryset()
        type_attestation = self.request.query_params.get('type_attestation')
        if type_attestation:
            if type_attestation == '653':
                queryset = queryset.filter(Q(type_attestation='653') | Q(type_attestation='Attestation rose'))
            elif type_attestation == '652':
                queryset = queryset.filter(Q(type_attestation='652') | Q(type_attestation='Attestation jaune'))
            else:
                queryset = queryset.filter(type_attestation=type_attestation)
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            print(f"CRITICAL ERROR AttestationViewSet.list: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur récupérant les attestations: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Création en masse d'attestations
        Génère automatiquement les numéros entre num_min et num_max
        
        Body:
        {
            "type_attestation": "653",
            "num_min": 100,
            "num_max": 200,
            "id_compagnie": "COMP001",
            "CodeAgence": "AG001",
            "ref_lot": "LOT-2026-001",
            "Remarque_attestation": "Lot de février 2026",
            "IDUTILISATEUR_save": "USER001"
        }
        """
        serializer = AttestationBulkCreateSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response({
                'success': True,
                'message': f"{result['count']} attestations créées avec succès",
                'count': result['count'],
                'num_min': result['num_min'],
                'num_max': result['num_max']
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Statistiques des attestations par type et état
        Gère les incohérences de données (codes vs libellés)
        """
        queryset = Attestation.objects.filter(effacer=False)
        
        # Récupérer toutes les stats brutes
        raw_stats = queryset.values('type_attestation', 'Etat_attestation').annotate(
            count=Count('id_attestation')
        )
        
        # Regrouper par type normalisé
        combined_stats = {}
        
        for item in raw_stats:
            raw_type = item['type_attestation']
            etat = item['Etat_attestation']
            count = item['count']
            
            # Normalisation du type
            norm_type = raw_type
            if raw_type in ['653', 'Attestation rose']:
                norm_type = '653'
            elif raw_type in ['652', 'Attestation jaune']:
                norm_type = '652'
            
            key = (norm_type, etat)
            if key in combined_stats:
                combined_stats[key]['count'] += count
            else:
                combined_stats[key] = {
                    'type_attestation': norm_type,
                    'Etat_attestation': etat,
                    'count': count
                }
        
        result = list(combined_stats.values())
        serializer = AttestationStatsSerializer(result, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def references(self, request):
        """
        Liste des références de lots avec compteurs
        Query params:
        - search: recherche dans ref_lot
        - date_enreg: filtrer par date
        """
        search = request.query_params.get('search', '')
        type_attestation = request.query_params.get('type_attestation')
        
        queryset = Attestation.objects.filter(effacer=False)

        if type_attestation:
            if type_attestation == '653':
                queryset = queryset.filter(Q(type_attestation='653') | Q(type_attestation='Attestation rose'))
            elif type_attestation == '652':
                queryset = queryset.filter(Q(type_attestation='652') | Q(type_attestation='Attestation jaune'))
            else:
                queryset = queryset.filter(type_attestation=type_attestation)
        
        if search:
            queryset = queryset.filter(ref_lot__icontains=search)
        
        # Grouper par ref_lot uniquement pour avoir des lots uniques
        # On prend la date la plus récente pour le tri
        from django.db.models import Max
        references = queryset.values('ref_lot').annotate(
            count=Count('id_attestation'),
            date_enreg=Max('date_enreg')
        ).order_by('-date_enreg')
        
        return Response(references)

    @action(detail=False, methods=['post'])
    def assign_selection(self, request):
        """
        Assigner un état, une compagnie et/ou une agence à une sélection d'attestations
        Body:
        {
            "attestation_ids": ["id1", "id2", ...],
            "Etat_attestation": 1, (Optionnel)
            "id_compagnie": "COMP001", (Optionnel)
            "CodeAgence": "AG001" (Optionnel)
        }
        """
        attestation_ids = request.data.get('attestation_ids', [])
        etat = request.data.get('Etat_attestation')
        id_compagnie = request.data.get('id_compagnie')
        code_agence = request.data.get('CodeAgence')
        
        if not attestation_ids:
            return Response(
                {'error': 'attestation_ids est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        update_data = {}
        if etat is not None:
            update_data['Etat_attestation'] = etat
        if id_compagnie:
            update_data['id_compagnie'] = id_compagnie
        if code_agence:
            update_data['CodeAgence'] = code_agence
            
        if not update_data:
             return Response(
                {'error': 'Aucune donnée à mettre à jour fournie'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated = Attestation.objects.filter(
            id_attestation__in=attestation_ids,
            effacer=False
        ).update(**update_data)
        
        return Response({
            'success': True,
            'message': f'{updated} attestations mises à jour',
            'count': updated
        })

    @action(detail=False, methods=['post'])
    def delete_selection(self, request):
        """
        Supprimer (soft delete) une sélection d'attestations
        Body:
        {
            "attestation_ids": ["id1", "id2", ...]
        }
        """
        attestation_ids = request.data.get('attestation_ids', [])
        
        if not attestation_ids:
            return Response(
                {'error': 'attestation_ids est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted = Attestation.objects.filter(
            id_attestation__in=attestation_ids,
            effacer=False
        ).update(effacer=True)
        
        return Response({
            'success': True,
            'message': f'{deleted} attestations supprimées',
            'count': deleted
        })

    @action(detail=False, methods=['post'])
    def assign_contract(self, request):
        """
        Assigner des attestations à un contrat (et ses risques)
        Body:
        {
            "id_contrat": "CONT001",
            "assignments": [
                {
                    "id_risque": "RISK001",
                    "num_attestation": "12345",
                    "id_attestation": "ATT001"
                },
                ...
            ]
        }
        """
        id_contrat = request.data.get('id_contrat')
        assignments = request.data.get('assignments', [])
        
        if not id_contrat or not assignments:
             return Response(
                {'error': 'id_contrat et assignments sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        from django.db import transaction
        from apps.contrats.models import ContratRisques
        
        count = 0
        errors = []
        
        try:
            with transaction.atomic():
                for item in assignments:
                    id_risque = item.get('id_risque')
                    id_attestation = item.get('id_attestation')
                    
                    if not id_risque or not id_attestation:
                        continue
                        
                    # 1. Récupérer l'attestation
                    attestation = Attestation.objects.filter(
                        id_attestation=id_attestation, 
                        effacer=False
                    ).first()
                    
                    if not attestation:
                        errors.append(f"Attestation {id_attestation} introuvable")
                        continue
                        
                    # 2. Récupérer le lien Contrat-Risque
                    lien = ContratRisques.objects.filter(
                        id_contrat=id_contrat,
                        id_risque=id_risque
                    ).first()
                    
                    if not lien:
                        # Si le lien n'existe pas, c'est bizarre car on vient de la liste des risques du contrat
                        # Mais on peut logguer l'erreur
                        errors.append(f"Lien Contrat {id_contrat} - Risque {id_risque} introuvable")
                        continue
                    
                    # 3. Mettre à jour le lien selon le type d'attestation
                    type_att = str(attestation.type_attestation)
                    update_fields = {}
                    
                    if type_att in ['653', 'Attestation rose']:
                        update_fields['attestation_rose'] = attestation.Num_attestation
                    elif type_att in ['652', 'Attestation jaune']:
                        update_fields['attestation_jaune'] = attestation.Num_attestation
                    
                    if update_fields:
                        ContratRisques.objects.filter(
                            id_contrat=id_contrat,
                            id_risque=id_risque
                        ).update(**update_fields)
                    
                    # 4. Mettre à jour l'attestation (Status = 1 Utilisé)
                    Attestation.objects.filter(
                        id_attestation=id_attestation
                    ).update(Etat_attestation=1)
                    
                    count += 1
                    
        except Exception as e:
            print(f"CRITICAL ERROR assign_contract: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        return Response({
            'success': True,
            'message': f"{count} attestations affectées avec succès",
            'count': count,
            'errors': errors
        })

    def perform_destroy(self, instance):
        """Soft delete"""
        instance.effacer = True
        instance.save()

    @action(detail=True, methods=['get'])
    def tracking(self, request, pk=None):
        """
        Récupérer l'historique d'utilisation d'une attestation (Police, Client, Véhicule)
        """
        try:
            attestation = self.get_object()
            
            # Import retardé pour éviter les imports circulaires si besoin
            from contrats.models import ContratRisques, Contrat, Risques
            from crm.models import Client
            from core.models import Agence
            
            # Force string conversion for comparison with CharFields
            num = str(attestation.Num_attestation)
            
            # Debug logging
            print(f"DEBUG: Tracking for attestation {num} (type: {attestation.type_attestation})")
            
            # Chercher dans Contrat_Risques (Lien direct via les champs d'attestation)
            # Note: Contrat_Risques stores types as string?
            links = ContratRisques.objects.filter(
                Q(attestation_jaune=num) | Q(attestation_rose=num),
                effacer=False
            )
            print(f"DEBUG: Found {links.count()} links in ContratRisques")
            
            history = []
            for link in links:
                try:
                    contrat = Contrat.objects.filter(id_contrat=link.id_contrat, effacer=False).first()
                    risque = Risques.objects.filter(id_risque=link.id_risque, effacer=False).first()
                    
                    if contrat:
                        client = Client.objects.filter(id_client=contrat.ID_Client, effacer=False).first()
                        
                        # Agency lookup (Contract)
                        code_agence_val = (contrat.CodeAgence or "").strip()
                        print(f"DEBUG: Contract {contrat.id_contrat} Agency Code: '{code_agence_val}'")
                        
                        agence_name = "-"
                        if code_agence_val:
                            # Look for agency (even if soft deleted) to show name
                            agence = Agence.objects.filter(codeagence=code_agence_val).first()
                            if agence:
                                agence_name = agence.nomagence
                            else:
                                agence_name = code_agence_val # Fallback to ID
                                print(f"DEBUG: Agency not found for code '{code_agence_val}'")

                        # Safe access to client and risque fields
                        client_name = "Inconnu"
                        if client:
                            client_name = f"{client.prenom_client or ''} {client.nom_client or ''}".strip()
                        elif contrat.ID_Client:
                            client_name = contrat.ID_Client
                        
                        vehicule_info = "-"
                        if risque:
                            vehicule_info = f"{risque.veh_marque or ''} {risque.veh_modele or ''} {risque.veh_immat or ''}".strip()
                        
                        history.append({
                            'police': contrat.numPolice or "-",
                            'client': client_name,
                            'vehicule': vehicule_info,
                            'agence': agence_name
                        })
                except Exception as e:
                    print(f"ERROR processing link {link.id_contrat}: {e}")
                    continue
            
            # Get current agency name for the attestation itself
            current_agence_name = "-"
            code_att_agence = (attestation.CodeAgence or "").strip()
            print(f"DEBUG: Attestation Agency Code: '{code_att_agence}'")
            
            if code_att_agence:
                current_agence = Agence.objects.filter(codeagence=code_att_agence).first()
                if current_agence:
                    current_agence_name = current_agence.nomagence
                else:
                    current_agence_name = code_att_agence # Fallback

            return Response({
                'num': attestation.Num_attestation,
                'type_id': attestation.type_attestation,
                'type_label': "Attestation rose" if str(attestation.type_attestation) in ['653', 'Attestation rose'] else "Attestation jaune",
                'etat': attestation.Etat_attestation,
                'agence': current_agence_name,
                'history': history
            })
        except Exception as e:
            print(f"CRITICAL ERROR in tracking view: {e}")
            return Response(
                {'error': f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


