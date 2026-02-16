"""
Modèles pour le module Finance / Comptabilité
"""
from django.db import models


class Mouvement(models.Model):
    """
    Modèle pour la table MOUVEMENTS
    Représente les mouvements (débits/crédits) sur les comptes
    """
    idquittance = models.CharField(max_length=255, primary_key=True, db_column='idquittance')
    idmouvement = models.CharField(max_length=255, db_column='idmouvement', blank=True, null=True)
    datemouvement = models.DateTimeField(db_column='datemouvement', blank=True, null=True)
    mont_debit = models.CharField(max_length=255, db_column='mont_debit', blank=True, null=True)
    mont_credit = models.CharField(max_length=255, db_column='mont_credit', blank=True, null=True)
    observation = models.TextField(db_column='observation', blank=True, null=True)
    sync = models.BooleanField(db_column='sync', default=False)
    effacer = models.BooleanField(db_column='Effacer', default=False)
    id_type_mvt = models.CharField(max_length=255, db_column='IDTYPE_MVT', blank=True, null=True)
    solde_caisse = models.CharField(max_length=255, db_column='solde_caisse', blank=True, null=True)
    lib_type_mvt = models.CharField(max_length=255, db_column='LibType_Mouvement', blank=True, null=True)
    idtransfert = models.CharField(max_length=255, db_column='idtransfert', blank=True, null=True) # Probablement ID Client ou tiers
    nature_compte = models.CharField(max_length=255, db_column='nature_compte', blank=True, null=True)
    date_annulation = models.DateTimeField(db_column='date_annulation', blank=True, null=True)
    num_mvt = models.IntegerField(db_column='num_MVT', blank=True, null=True)
    est_annuler_par = models.CharField(max_length=255, db_column='est_annuler_par', blank=True, null=True)
    date_enreg_mvt = models.DateTimeField(db_column='date_enreg_mvt', blank=True, null=True)
    est_annuler = models.BooleanField(db_column='est_annuler', default=False)
    id_caisse = models.CharField(max_length=255, db_column='IDCaisse', blank=True, null=True)
    date_synchro = models.DateTimeField(db_column='date_synchro', blank=True, null=True)
    id_utilisateur_save = models.CharField(max_length=255, db_column='IDUTILISATEUR_save', blank=True, null=True)
    nom_utilisateur = models.CharField(max_length=255, db_column='Nom_utilisateur', blank=True, null=True)
    daterecupserveur = models.DateTimeField(db_column='daterecupserveur', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mouvements'
        app_label = 'finances'
        ordering = ['-datemouvement', '-date_enreg_mvt']

    def __str__(self):
        return f"{self.lib_type_mvt} - {self.mont_credit or self.mont_debit}"

    @property
    def debit_amount(self):
        try:
            return float(self.mont_debit) if self.mont_debit else 0.0
        except:
            return 0.0

    @property
    def credit_amount(self):
        try:
            return float(self.mont_credit) if self.mont_credit else 0.0
        except:
            return 0.0


class TypeMouvementManuel(models.Model):
    """
    Modèle pour la table TYPE_MVT_MANUEL
    """
    id_type_mvt = models.CharField(max_length=255, primary_key=True, db_column='IDTYPE_MVT')
    lib_type_mouvement = models.CharField(max_length=255, db_column='LibType_Mouvement', blank=True, null=True)
    type_op = models.BooleanField(db_column='typeOP', default=False) # 0 = débit, 1 = crédit selon convention?
    effacer = models.BooleanField(db_column='Effacer', default=False)
    acteur = models.CharField(max_length=255, db_column='Acteur', blank=True, null=True)
    id_utilisateur_save = models.CharField(max_length=255, db_column='IDUTILISATEUR_save', blank=True, null=True)
    date_enreg = models.DateTimeField(db_column='date_enreg', blank=True, null=True)
    date_modif = models.DateTimeField(db_column='date_modif', blank=True, null=True)
    date_synchro = models.DateTimeField(db_column='date_synchro', blank=True, null=True)
    daterecupserveur = models.DateTimeField(db_column='daterecupserveur', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'type_mvt_manuel'
        app_label = 'finances'
        ordering = ['lib_type_mouvement']

    def __str__(self):
        return self.lib_type_mouvement


class TypeMouvementAutomatique(models.Model):
    """
    Modèle pour la table TYPE_MVT_AUTOMATIQUE
    Types de mouvements générés automatiquement par le système
    """
    id_type_mvt = models.CharField(max_length=255, primary_key=True, db_column='IDTYPE_MVT')
    lib_type_mouvement = models.CharField(max_length=255, db_column='LibType_Mouvement', blank=True, null=True)
    type_op = models.BooleanField(db_column='typeOP', default=False)  # 0 = débit, 1 = crédit
    acteur = models.CharField(max_length=255, db_column='Acteur', blank=True, null=True)
    date_synchro = models.DateTimeField(db_column='date_synchro', blank=True, null=True)
    effacer = models.BooleanField(db_column='effacer', default=False)
    daterecupserveur = models.DateTimeField(db_column='daterecupserveur', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'type_mvt_automatique'
        app_label = 'finances'
        ordering = ['lib_type_mouvement']

    def __str__(self):
        return self.lib_type_mouvement


class Caisse(models.Model):
    """
    Modèle pour la table Caisse
    """
    id_caisse = models.CharField(max_length=255, primary_key=True, db_column='IDCaisse')
    lib_caisse = models.CharField(max_length=255, db_column='lib_caisse', blank=True, null=True)
    effacer = models.BooleanField(db_column='Effacer', default=False)
    
    class Meta:
        managed = False
        db_table = 'caisse'
        app_label = 'finances'
        ordering = ['lib_caisse']

    def __str__(self):
        return self.lib_caisse
