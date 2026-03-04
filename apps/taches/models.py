"""
Modèles pour le module Tâches — table 'taches' (existante dans la DB)
statut_tache : 0 = En attente, 1 = En cours, 2 = Terminé
"""
from django.db import models


class Tache(models.Model):
    idtaches = models.CharField(max_length=50, primary_key=True, db_column='IDTACHES')
    date_echeance_tache = models.DateTimeField(db_column='date_echeance_tache', blank=True, null=True)
    date_creation_tache = models.DateTimeField(db_column='date_creation_tache', blank=True, null=True)
    titre_tache = models.CharField(max_length=255, db_column='titre_tache', blank=True, null=True)
    date_cloture_tache = models.DateTimeField(db_column='date_cloture_tache', blank=True, null=True)
    idutilisateur_save = models.CharField(max_length=50, db_column='IDUTILISATEUR_save', blank=True, null=True)
    date_enreg = models.DateTimeField(db_column='date_enreg', blank=True, null=True)
    date_synchro = models.DateTimeField(db_column='date_synchro', blank=True, null=True)
    sync = models.BooleanField(db_column='sync', default=False)
    effacer = models.BooleanField(db_column='effacer', default=False)
    idutilisateur_affecter = models.CharField(max_length=50, db_column='IDUTILISATEUR_affecter', blank=True, null=True)
    description_tache = models.TextField(db_column='description_tache', blank=True, null=True)
    statut_tache = models.IntegerField(db_column='statut_tache', default=0, blank=True, null=True)
    date_modif = models.DateTimeField(db_column='date_modif', blank=True, null=True)
    id_client = models.CharField(max_length=50, db_column='ID_Client', blank=True, null=True)
    idinteraction = models.CharField(max_length=50, db_column='IDINTERACTION', blank=True, null=True)
    code_couleur = models.CharField(max_length=20, db_column='code_couleur', blank=True, null=True)
    daterecupserveur = models.DateTimeField(db_column='daterecupserveur', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'taches'
        ordering = ['-date_creation_tache']

    def __str__(self):
        return self.titre_tache or str(self.idtaches)
