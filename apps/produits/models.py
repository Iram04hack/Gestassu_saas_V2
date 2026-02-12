"""
Modèles pour le module Produits
"""
from django.db import models


class GroupeProduit(models.Model):
    """
    Modèle pour la table GROUPE_PRODUIT existante
    """
    code_groupe_prod = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='code_groupe_prod'
    )
    lib_groupe_prod = models.CharField(
        max_length=255,
        db_column='lib_groupe_prod',
        blank=True,
        null=True
    )
    sync = models.BooleanField(
        db_column='sync',
        default=False
    )
    date_synchro = models.DateTimeField(
        db_column='date_synchro',
        blank=True,
        null=True
    )
    effacer = models.BooleanField(
        db_column='effacer',
        default=False
    )
    daterecupserveur = models.DateTimeField(
        db_column='daterecupserveur',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'groupe_produit'
        ordering = ['lib_groupe_prod']

    def __str__(self):
        return self.lib_groupe_prod or self.code_groupe_prod


class Produit(models.Model):
    """
    Modèle pour la table Produit existante
    Représente un produit d'assurance
    """
    id_produit = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='id_produit'
    )
    lib_produit = models.CharField(
        max_length=255,
        db_column='lib_produit',
        blank=True,
        null=True
    )
    branche = models.CharField(
        max_length=255,
        db_column='branche',
        blank=True,
        null=True
    )
    type_risque = models.CharField(
        max_length=255,
        db_column='type_risque',
        blank=True,
        null=True
    )
    codification_produit = models.CharField(
        max_length=255,
        db_column='codification_produit',
        blank=True,
        null=True
    )
    Id_compagnie = models.CharField(
        max_length=255,
        db_column='Id_compagnie',
        blank=True,
        null=True
    )
    taux_commission = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='taux_commission',
        blank=True,
        null=True
    )
    montant_fixe_commission = models.CharField(
        max_length=255,
        db_column='montant_fixe_commission',
        blank=True,
        null=True
    )
    taux_taxe = models.CharField(
        max_length=255,
        db_column='taux_taxe',
        blank=True,
        null=True
    )
    code_groupe_prod = models.CharField(
        max_length=255,
        db_column='code_groupe_prod',
        blank=True,
        null=True
    )
    frais_gestion = models.IntegerField(
        db_column='frais_gestion',
        blank=True,
        null=True
    )
    frais_adhesion = models.IntegerField(
        db_column='frais_adhesion',
        blank=True,
        null=True
    )
    taux_frais_gestion = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='taux_frais_gestion',
        blank=True,
        null=True
    )
    taux_com_premiere_an = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='taux_com_premiere_an',
        blank=True,
        null=True
    )
    taux_com_an_suivant = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='taux_com_an_suivant',
        blank=True,
        null=True
    )
    
    # Champs de gestion
    date_enreg = models.DateTimeField(
        db_column='date_enreg',
        blank=True,
        null=True
    )
    date_modif = models.DateTimeField(
        db_column='date_modif',
        blank=True,
        null=True
    )
    effacer = models.BooleanField(
        db_column='effacer',
        default=False
    )
    sync = models.BooleanField(
        db_column='sync',
        default=False
    )
    date_synchro = models.DateTimeField(
        db_column='date_synchro',
        blank=True,
        null=True
    )
    idutilisateur_save = models.CharField(
        max_length=255,
        db_column='IDUTILISATEUR_save',
        blank=True,
        null=True
    )
    daterecupserveur = models.DateTimeField(
        db_column='daterecupserveur',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'produit'
        ordering = ['lib_produit']

    def __str__(self):
        return self.lib_produit or self.id_produit


class CatVehicule(models.Model):
    """
    Modèle pour la table cat_vehicule existante (Catégories de véhicules)
    """
    code_cat = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='code_cat'
    )
    lib_cat = models.CharField(
        max_length=255,
        db_column='lib_cat',
        blank=True,
        null=True
    )
    description_cat = models.TextField(
        db_column='description_cat',
        blank=True,
        null=True
    )
    enable_flotte = models.BooleanField(
        db_column='enable_flotte',
        default=False
    )
    
    # Champs audit
    effacer = models.BooleanField(
        db_column='effacer',
        default=False
    )
    sync = models.BooleanField(
        db_column='sync',
        default=False
    )
    date_modif = models.DateTimeField(
        db_column='date_modif',
        auto_now=True,
        blank=True,
        null=True
    )
    date_synchro = models.DateTimeField(
        db_column='date_synchro',
        blank=True,
        null=True
    )
    date_enreg = models.DateTimeField(
        db_column='date_enreg',
        auto_now_add=True,
        blank=True,
        null=True
    )
    idutilisateur_save = models.CharField(
        max_length=255,
        db_column='IDUTILISATEUR_save',
        blank=True,
        null=True
    )
    daterecupserveur = models.DateTimeField(
        db_column='daterecupserveur',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'cat_vehicule'
        ordering = ['lib_cat']

    def __str__(self):
        return self.lib_cat or self.code_cat
