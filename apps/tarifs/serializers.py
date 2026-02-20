"""
Serializers pour le module Tarifs
"""
from rest_framework import serializers
from django.core.cache import cache
from .models import TarifAuto, TarifMRH


# ── Cache helpers pour optimiser les requêtes ──
def get_cached_compagnies():
    """Cache les compagnies pour 5 minutes"""
    key = 'compagnies_dict'
    data = cache.get(key)
    if data is None:
        from compagnies.models import Compagnie
        compagnies = Compagnie.objects.filter(effacer=False).only('id_compagnie', 'nom_compagnie')
        data = {c.id_compagnie: c.nom_compagnie for c in compagnies}
        cache.set(key, data, 300)  # 5 minutes
    return data


def get_cached_produits():
    """Cache les produits pour 5 minutes"""
    key = 'produits_dict'
    data = cache.get(key)
    if data is None:
        from produits.models import Produit
        produits = Produit.objects.filter(effacer=False).only('id_produit', 'lib_produit')
        data = {p.id_produit: p.lib_produit for p in produits}
        cache.set(key, data, 300)  # 5 minutes
    return data


def get_cached_garanties():
    """Cache les garanties pour 5 minutes"""
    key = 'garanties_dict'
    data = cache.get(key)
    if data is None:
        from produits.models import Garantie
        garanties = Garantie.objects.filter(effacer=False).only('id_garantie', 'libelle_garantie')
        data = {g.id_garantie: g.libelle_garantie for g in garanties}
        cache.set(key, data, 300)  # 5 minutes
    return data


def get_cached_categories():
    """Cache les catégories véhicules pour 5 minutes"""
    key = 'categories_dict'
    data = cache.get(key)
    if data is None:
        from produits.models import CatVehicule
        categories = CatVehicule.objects.filter(effacer=False).only('code_cat', 'lib_cat')
        data = {c.code_cat: c.lib_cat for c in categories}
        cache.set(key, data, 300)  # 5 minutes
    return data


class TarifAutoSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle TarifAuto.
    Les champs Python du modèle sont en snake_case minuscule,
    mais les colonnes DB ont des casses mixtes (Id_compagnie, ID_Garantie).
    On expose les noms Python du modèle dans l'API.
    """
    # Champs calculés (lecture seule) pour afficher les libellés
    nom_compagnie = serializers.SerializerMethodField()
    lib_produit   = serializers.SerializerMethodField()
    lib_cat       = serializers.SerializerMethodField()
    lib_garantie  = serializers.SerializerMethodField()

    class Meta:
        model  = TarifAuto
        fields = '__all__'

    def get_nom_compagnie(self, obj):
        """Utilise le cache pour éviter les requêtes répétées"""
        if not obj.id_compagnie:
            return None
        compagnies = get_cached_compagnies()
        return compagnies.get(obj.id_compagnie, obj.id_compagnie)

    def get_lib_produit(self, obj):
        """Utilise le cache pour éviter les requêtes répétées"""
        if not obj.id_produit:
            return None
        produits = get_cached_produits()
        return produits.get(obj.id_produit, obj.id_produit)

    def get_lib_cat(self, obj):
        """Utilise le cache pour éviter les requêtes répétées"""
        if not obj.code_cat:
            return None
        categories = get_cached_categories()
        return categories.get(obj.code_cat, obj.code_cat)

    def get_lib_garantie(self, obj):
        """Utilise le cache pour éviter les requêtes répétées"""
        if not obj.id_garantie:
            return None
        garanties = get_cached_garanties()
        return garanties.get(obj.id_garantie, obj.id_garantie)


class TarifMRHSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle TarifMRH (Multirisque Habitation).
    Expose les libellés des relations pour l'affichage.
    """
    # Champs calculés pour afficher les libellés
    nom_compagnie = serializers.SerializerMethodField()
    lib_produit = serializers.SerializerMethodField()
    lib_garantie = serializers.SerializerMethodField()

    class Meta:
        model = TarifMRH
        fields = '__all__'

    def get_nom_compagnie(self, obj):
        """Utilise le cache pour éviter les requêtes répétées"""
        if not obj.idcompagnie:
            return None
        compagnies = get_cached_compagnies()
        return compagnies.get(obj.idcompagnie, obj.idcompagnie)

    def get_lib_produit(self, obj):
        """Utilise le cache pour éviter les requêtes répétées"""
        if not obj.id_produit:
            return None
        produits = get_cached_produits()
        return produits.get(obj.id_produit, obj.id_produit)

    def get_lib_garantie(self, obj):
        """Utilise le cache pour éviter les requêtes répétées"""
        if not obj.id_garantie:
            return None
        garanties = get_cached_garanties()
        return garanties.get(obj.id_garantie, obj.id_garantie)
