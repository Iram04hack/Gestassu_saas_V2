"""
Models pour le module Compagnies
Basés sur la base de données existante
"""
from django.db import models


class Compagnie(models.Model):
    """
    Model pour la table COMPAGNIE existante
    Représente une compagnie d'assurance
    """
    id_compagnie = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='id_compagnie'
    )
    nom_compagnie = models.CharField(
        max_length=255,
        db_column='nom_compagnie',
        blank=True,
        null=True
    )
    tel_compagnie = models.CharField(
        max_length=255,
        db_column='tel_compagnie',
        blank=True,
        null=True
    )
    adresse_compagnie = models.CharField(
        max_length=255,
        db_column='adresse_compagnie',
        blank=True,
        null=True
    )
    email_compagnie = models.CharField(
        max_length=255,
        db_column='email_compagnie',
        blank=True,
        null=True
    )
    logo = models.CharField(
        max_length=255,
        db_column='logo',
        blank=True,
        null=True
    )
    url_logo = models.CharField(
        max_length=255,
        db_column='Url_logo',
        blank=True,
        null=True
    )
    codification_compagnie = models.CharField(
        max_length=255,
        db_column='codification_compagnie',
        blank=True,
        null=True
    )
    
    # Champs de gestion
    date_enreg = models.DateTimeField(
        db_column='date_enreg',
        auto_now_add=True
    )
    date_modif = models.DateTimeField(
        db_column='date_modif',
        auto_now=True,
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
        app_label = 'compagnies'
        managed = False  # Ne pas gérer la table (elle existe déjà)
        db_table = 'compagnie'  # Nom exact de la table dans la BD (minuscules)
        ordering = ['nom_compagnie']

    def __str__(self):
        return self.nom_compagnie or self.id_compagnie


class ContactCompagnie(models.Model):
    """
    Model pour la table Contact_compagnie existante
    Représente un contact d'une compagnie d'assurance
    """
    idcontact_compagnie = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='idcontact_compagnie'
    )
    id_compagnie = models.CharField(
        max_length=255,
        db_column='Id_compagnie',
        blank=True,
        null=True
    )
    nom_contact = models.CharField(
        max_length=255,
        db_column='Nom_contact',
        blank=True,
        null=True
    )
    tel_contact = models.CharField(
        max_length=255,
        db_column='tel_contact',
        blank=True,
        null=True
    )
    whatsapp_contact = models.CharField(
        max_length=255,
        db_column='whatsapp_contact',
        blank=True,
        null=True
    )
    email_contact = models.CharField(
        max_length=255,
        db_column='email_contact',
        blank=True,
        null=True
    )
    fonction_contact = models.CharField(
        max_length=255,
        db_column='fonction_contact',
        blank=True,
        null=True
    )
    
    # Champs de gestion
    date_enreg = models.DateTimeField(
        db_column='date_enreg',
        auto_now_add=True
    )
    date_modif = models.DateTimeField(
        db_column='date_modif',
        auto_now=True,
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
        app_label = 'compagnies'
        managed = False
        db_table = 'contact_compagnie'  # Nom exact de la table dans la BD (minuscules)
        ordering = ['nom_contact']

    def __str__(self):
        return f"{self.nom_contact} - {self.fonction_contact or ''}"


class FraisAccessoire(models.Model):
    """
    Model pour la table FRAIS_ACCESSOIRE existante
    Représente les frais accessoires d'une compagnie
    """
    idfraisaccess = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='IDFRAISACCESS'
    )
    id_compagnie = models.CharField(
        max_length=255,
        db_column='Id_compagnie',
        blank=True,
        null=True
    )
    interv_min = models.IntegerField(
        db_column='INTERV_MIN',
        blank=True,
        null=True
    )
    interv_max = models.IntegerField(
        db_column='INTERV_MAX',
        blank=True,
        null=True
    )
    montant = models.IntegerField(
        db_column='MONTANT',
        blank=True,
        null=True
    )
    
    # Champs de gestion
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
    daterecupserveur = models.DateTimeField(
        db_column='daterecupserveur',
        blank=True,
        null=True
    )

    class Meta:
        app_label = 'compagnies'
        managed = False
        db_table = 'frais_accessoire'
        ordering = ['interv_min']

    def __str__(self):
        return f"Accessoire {self.interv_min}-{self.interv_max}: {self.montant}"

