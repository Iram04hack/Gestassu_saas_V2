"""
Modèles Core pour Gestassu
Contient les modèles de base: Agence et INFO_SOCIETE
"""
from django.db import models


class Agence(models.Model):
    """
    Modèle Agence basé sur la table existante
    Représente les différentes agences du courtier
    """
    
    codeagence = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='CodeAgence',
        verbose_name='Code Agence'
    )
    nomagence = models.CharField(
        max_length=255,
        db_column='nom_agence',
        verbose_name='Nom de l\'agence'
    )
    adresseagence = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column='adresse_agence',
        verbose_name='Adresse'
    )
    telagence = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column='tel_agence',
        verbose_name='Téléphone'
    )
    emailagence = models.EmailField(
        max_length=255,
        blank=True,
        null=True,
        db_column='email_agence',
        verbose_name='Email'
    )
    
    # Champs d'audit
    effacer = models.BooleanField(
        default=False,
        verbose_name='Supprimé'
    )
    sync = models.BooleanField(
        default=False,
        verbose_name='Synchronisé'
    )
    date_synchro = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Date synchronisation'
    )
    date_modif = models.DateTimeField(
        auto_now=True,
        verbose_name='Date modification'
    )
    date_enreg = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date enregistrement'
    )
    daterecupserveur = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Date récupération serveur'
    )
    idutilisateur_save = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column='IDUTILISATEUR_save',
        verbose_name='Enregistré par'
    )
    
    class Meta:
        db_table = 'agence'
        managed = False  # Ne pas modifier la table existante
        verbose_name = 'Agence'
        verbose_name_plural = 'Agences'
        ordering = ['nomagence']
    
    def __str__(self):
        return f"{self.nomagence} ({self.codeagence})"


class InfoSociete(models.Model):
    """
    Modèle INFO_SOCIETE basé sur la table existante
    Contient les informations générales du courtier
    """
    
    # Raison sociale utilisée comme clé primaire car pas d'ID explicite
    raisonsocial = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='raisonsocial',
        verbose_name='Raison Sociale'
    )
    
    adressesociete = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column='Adresse',
        verbose_name='Adresse'
    )
    telsociete = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column='tel_courtier',
        verbose_name='Téléphone'
    )
    emailsociete = models.EmailField(
        max_length=255,
        blank=True,
        null=True,
        db_column='email_courtier',
        verbose_name='Email'
    )
    logosociete = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        db_column='logo_courtier',
        verbose_name='Logo (chemin)'
    )
    
    # Champs spécifiques trouvés dans la DB
    bp_courtier = models.CharField(
        max_length=100,
        blank=True, 
        null=True,
        db_column='BP_coutier',
        verbose_name='Boîte Postale'
    )
    fax_courtier = models.CharField(
        max_length=100,
        blank=True, 
        null=True,
        db_column='Fax_coutier',
        verbose_name='Fax'
    )
    basdepage = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        db_column='basdepage',
        verbose_name='Pied de page'
    )
    
    # Champs d'audit
    effacer = models.BooleanField(
        default=False,
        verbose_name='Supprimé'
    )
    sync = models.BooleanField(
        default=False,
        verbose_name='Synchronisé'
    )
    date_synchro = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Date synchronisation'
    )
    date_modif = models.DateTimeField(
        auto_now=True,
        verbose_name='Date modification'
    )
    date_enreg = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date enregistrement'
    )
    daterecupserveur = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Date récupération serveur'
    )
    idutilisateur_save = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column='IDUTILISATEUR_save',
        verbose_name='Enregistré par'
    )
    
    class Meta:
        db_table = 'info_societe'
        managed = False  # Ne pas modifier la table existante
        verbose_name = 'Information Société'
        verbose_name_plural = 'Informations Société'
    
    def __str__(self):
        return self.raisonsocial
