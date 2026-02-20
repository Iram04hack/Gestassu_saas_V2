"""
Modèles pour le module Tarifs
"""
from django.db import models


class TarifAuto(models.Model):
    """
    Modèle pour la table tarif_auto existante.
    Grille de tarification pour l'assurance automobile.
    """
    idtarif = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='idtarif'
    )
    
    # Relations (Clés étrangères logiques, mais définies en CharField pour correspondre à la BD existante)
    # Nous pourrions utiliser ForeignKey(..., db_constraint=False) si nous sommes sûrs des données
    # Pour l'instant on garde CharField pour la sécurité, et on gère les relations dans les serializers
    
    id_produit = models.CharField(
        max_length=255,
        db_column='id_produit',
        blank=True,
        null=True
    )
    
    id_compagnie = models.CharField(
        max_length=255,
        db_column='Id_compagnie', # Attention à la casse dans la DB
        blank=True,
        null=True
    )
    
    code_cat = models.CharField(
        max_length=255,
        db_column='code_cat',
        blank=True,
        null=True
    )
    
    id_garantie = models.CharField(
        max_length=255,
        db_column='ID_Garantie',
        blank=True,
        null=True
    )
    
    # Critères de tarification
    groupe = models.CharField(
        max_length=255,
        db_column='groupe',
        blank=True,
        null=True
    )
    
    energie = models.CharField(
        max_length=255,
        db_column='energie',
        blank=True,
        null=True
    )
    
    puissance_fiscale = models.IntegerField(
        db_column='puissance_fiscale',
        blank=True,
        null=True
    )
    
    valeur_vehicule = models.IntegerField(
        db_column='valeur_vehicule',
        blank=True,
        null=True
    )
    
    # Tarifs et Primes
    prime_fixe = models.IntegerField(
        db_column='prime_fixe',
        blank=True,
        null=True
    )
    
    prime_taux = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='prime_taux',
        blank=True,
        null=True
    )
    
    prime_minimun = models.IntegerField(
        db_column='prime_minimun',
        blank=True,
        null=True
    )
    
    prime_taux_sur = models.CharField( # Champ texte dans la DB ("Valeur vénale", etc.)
        max_length=255,
        db_column='prime_taux_sur',
        blank=True,
        null=True
    )
    
    prime_taux_garantie = models.CharField(
        max_length=255,
        db_column='prime_taux_garantie',
        blank=True,
        null=True
    )
    
    capital = models.IntegerField(
        db_column='capital',
        blank=True,
        null=True
    )
    
    # Surprimes
    surprime_passager = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='surprime_passager', # Taux ?
        blank=True,
        null=True
    )
    
    surprime_passager_fixe = models.CharField( # VARCHAR dans le schéma ?!
        max_length=255,
        db_column='surprime_passager_fixe',
        blank=True,
        null=True
    )
    
    nb_passager_surprime = models.IntegerField(
        db_column='nb_passager_surprime',
        blank=True,
        null=True
    )

    surprime_remorque = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='surprime_remorque',
        blank=True,
        null=True
    )

    # Franchises
    franchise_fixe = models.IntegerField(
        db_column='franchise_fixe',
        blank=True,
        null=True
    )
    
    taux_franchise = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='taux_franchise',
        blank=True,
        null=True
    )
    
    franchise_min = models.IntegerField(
        db_column='franchise_min',
        blank=True,
        null=True
    )
    
    franchise_max = models.IntegerField(
        db_column='franchise_max',
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
    
    date_modif = models.DateTimeField(
        db_column='date_modif',
        auto_now=True,
        blank=True,
        null=True
    )
    
    daterecupserveur = models.DateTimeField(
        db_column='daterecupserveur',
        blank=True,
        null=True
    )
    
    # Note: Pas de date_enreg ou IDUTILISATEUR_save dans le schéma fournis pour cette table ?
    # Le schéma mentionne: date_modif, effacer, sync, date_synchro, daterecupserveur
    
    class Meta:
        managed = False
        db_table = 'tarif_auto'
        ordering = ['id_compagnie', 'groupe', 'code_cat']
        app_label = 'tarifs'

    def __str__(self):
        return f"{self.id_compagnie} - {self.code_cat} - {self.idtarif}"


class TarifMRH(models.Model):
    """
    Modèle pour la table tarif_mrh — Assurance Multirisque Habitation.
    Clé primaire : ID_Garantie (lie directement chaque ligne à une garantie).
    """
    # Clé primaire
    id_garantie = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='ID_Garantie'
    )

    # Identifiant secondaire de la ligne tarifaire
    idtarif_mrh = models.CharField(
        max_length=255,
        db_column='IDtarif_mrh',
        blank=True, null=True
    )

    # Clés étrangères logiques
    id_produit = models.CharField(
        max_length=255,
        db_column='id_produit',
        blank=True, null=True
    )
    idcompagnie = models.CharField(
        max_length=255,
        db_column='idcompagnie',
        blank=True, null=True
    )

    # Capital
    capital_min = models.CharField(
        max_length=255,
        db_column='capital_min',
        blank=True, null=True
    )
    capital_max = models.CharField(
        max_length=255,
        db_column='capital_max',
        blank=True, null=True
    )

    # Prime
    taux = models.DecimalField(
        max_digits=15, decimal_places=2,
        db_column='taux',
        blank=True, null=True
    )
    prime_fixe = models.IntegerField(
        db_column='prime_fixe',
        blank=True, null=True
    )
    montant_plafond = models.IntegerField(
        db_column='montant_plafond',
        blank=True, null=True
    )

    # Surprime
    surprime_taux = models.DecimalField(
        max_digits=15, decimal_places=2,
        db_column='surprime_taux',
        blank=True, null=True
    )
    surprime_fixe = models.IntegerField(
        db_column='surprime_fixe',
        blank=True, null=True
    )

    # Franchise
    taux_franchise = models.DecimalField(
        max_digits=15, decimal_places=2,
        db_column='taux_franchise',
        blank=True, null=True
    )
    franchise_fixe = models.IntegerField(
        db_column='franchise_fixe',
        blank=True, null=True
    )
    franchise_min = models.IntegerField(
        db_column='franchise_min',
        blank=True, null=True
    )
    franchise_max = models.IntegerField(
        db_column='franchise_max',
        blank=True, null=True
    )

    # Champs de gestion
    effacer = models.BooleanField(db_column='effacer', default=False)
    sync = models.BooleanField(db_column='sync', default=False)
    date_synchro = models.DateTimeField(db_column='date_synchro', blank=True, null=True)
    date_modif = models.DateTimeField(db_column='date_modif', auto_now=True, blank=True, null=True)
    daterecupserveur = models.DateTimeField(db_column='daterecupserveur', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tarif_mrh'
        ordering = ['idcompagnie', 'id_produit']
        app_label = 'tarifs'

    def __str__(self):
        return f"{self.idcompagnie} - {self.id_garantie}"

