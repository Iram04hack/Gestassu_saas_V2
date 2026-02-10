"""
Modèles pour le module Tâches
"""
from django.db import models


class Tache(models.Model):
    """
    Modèle pour gérer les tâches
    Comme il n'y a pas de table TACHE dans le schéma, on crée un modèle managé
    """
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
    ]
    
    id_tache = models.CharField(max_length=255, primary_key=True, db_column='id_tache')
    id_client = models.CharField(max_length=255, db_column='id_client', blank=True, null=True)
    titre_tache = models.CharField(max_length=255, db_column='titre_tache')
    description_tache = models.TextField(db_column='description_tache', blank=True, null=True)
    date_debut = models.DateTimeField(db_column='date_debut')
    date_echeance = models.DateTimeField(db_column='date_echeance', blank=True, null=True)
    statut = models.CharField(max_length=50, choices=STATUS_CHOICES, default='en_attente', db_column='statut')
    couleur_tache = models.CharField(max_length=50, db_column='couleur_tache', blank=True, null=True)
    affecter_a = models.CharField(max_length=255, db_column='affecter_a', blank=True, null=True)  # IDUTILISATEUR
    
    # Champs de gestion
    effacer = models.BooleanField(default=False, db_column='effacer')
    sync = models.BooleanField(default=False, db_column='sync')
    date_synchro = models.DateTimeField(blank=True, null=True, db_column='date_synchro')
    date_enreg = models.DateTimeField(auto_now_add=True, db_column='date_enreg')
    date_modif = models.DateTimeField(auto_now=True, db_column='date_modif')
    idutilisateur_save = models.CharField(max_length=255, blank=True, null=True, db_column='idutilisateur_save')

    class Meta:
        managed = True  # Django gérera cette table
        db_table = 'tache'
        ordering = ['-date_debut']

    def __str__(self):
        return self.titre_tache
