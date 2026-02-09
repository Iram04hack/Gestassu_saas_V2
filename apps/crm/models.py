"""
Models pour le module CRM (Customer Relationship Management)
Basés sur la base de données existante
"""
from django.db import models


class Client(models.Model):
    """
    Model pour la table CLIENT existante
    Représente un client ou prospect (entreprise ou personne)
    """
    id_client = models.CharField(
        max_length=255, 
        primary_key=True, 
        db_column='ID_Client'
    )
    nom_client = models.CharField(
        max_length=255, 
        db_column='Nom_client',
        blank=True,
        null=True
    )
    prenom_client = models.CharField(
        max_length=255,
        db_column='prenom_client',
        blank=True,
        null=True
    )
    adresse = models.CharField(
        max_length=255,
        db_column='Adresse',
        blank=True,
        null=True
    )
    email = models.CharField(
        max_length=255,
        db_column='Email',
        blank=True,
        null=True
    )
    telephone = models.CharField(
        max_length=255,
        db_column='Telephone',
        blank=True,
        null=True
    )
    tel_whatsapp = models.CharField(
        max_length=255,
        db_column='Tel_WhatsApp',
        blank=True,
        null=True
    )
    date_naissance = models.DateTimeField(
        db_column='Date_naissance',
        blank=True,
        null=True
    )
    profession = models.CharField(
        max_length=255,
        db_column='Profession',
        blank=True,
        null=True
    )
    civilite = models.CharField(
        max_length=255,
        db_column='civilite',
        blank=True,
        null=True
    )
    source = models.CharField(
        max_length=255,
        db_column='Source',
        blank=True,
        null=True
    )
    pays = models.CharField(
        max_length=255,
        db_column='pays',
        blank=True,
        null=True
    )
    autres_informations = models.CharField(
        max_length=255,
        db_column='Autres_Informations',
        blank=True,
        null=True
    )
    est_entreprise = models.BooleanField(
        db_column='est_entreprise',
        default=False
    )
    representant_entreprise = models.CharField(
        max_length=255,
        db_column='representant_Entreprise',
        blank=True,
        null=True
    )
    role_representant = models.CharField(
        max_length=255,
        db_column='role_representant',
        blank=True,
        null=True
    )
    nif_client = models.CharField(
        max_length=255,
        db_column='nif_client',
        blank=True,
        null=True
    )
    fax_client = models.CharField(
        max_length=255,
        db_column='Fax_client',
        blank=True,
        null=True
    )
    date_permis_cond = models.DateTimeField(
        db_column='date_permis_cond',
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
    idutilisateur_source = models.CharField(
        max_length=255,
        db_column='IDUTILISATEUR_source',
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
        managed = False  # Ne pas gérer la table (elle existe déjà)
        db_table = 'CLIENT'  # Nom exact de la table dans la BD
        ordering = ['-date_enreg']

    def __str__(self):
        if self.est_entreprise:
            return f"{self.nom_client or 'Entreprise'}"
        return f"{self.prenom_client or ''} {self.nom_client or ''}".strip() or self.id_client


class Interaction(models.Model):
    """
    Model pour la table INTERACTION existante
    Représente une interaction avec un client
    """
    idinteraction = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='IDINTERACTION'
    )
    id_client = models.CharField(
        max_length=255,
        db_column='ID_Client',
        blank=True,
        null=True
    )
    type_interaction = models.CharField(
        max_length=255,
        db_column='Type_interaction',
        blank=True,
        null=True
    )
    date_heure_interaction = models.DateTimeField(
        db_column='date_heure_interaction',
        blank=True,
        null=True
    )
    duree_interaction = models.CharField(
        max_length=255,
        db_column='duree_interaction',
        blank=True,
        null=True
    )
    lieu = models.CharField(
        max_length=255,
        db_column='Lieu',
        blank=True,
        null=True
    )
    description = models.TextField(
        db_column='Description',
        blank=True,
        null=True
    )
    resultat_interaction = models.CharField(
        max_length=255,
        db_column='Resultat_interaction',
        blank=True,
        null=True
    )
    date_rappel = models.DateTimeField(
        db_column='Date_rappel',
        blank=True,
        null=True
    )
    rappel_necessaire = models.BooleanField(
        db_column='rappel_necessaire',
        default=False
    )
    titre_rappel = models.CharField(
        max_length=255,
        db_column='titre_rappel',
        blank=True,
        null=True
    )
    idutilisateur_action = models.CharField(
        max_length=255,
        db_column='IDUTILISATEUR_action',
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
        managed = False
        db_table = 'INTERACTION'
        ordering = ['-date_heure_interaction']

    def __str__(self):
        return f"{self.type_interaction} - {self.id_client}"
