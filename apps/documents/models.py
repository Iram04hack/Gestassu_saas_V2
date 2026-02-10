"""
Modèles pour le module Documents
"""
from django.db import models


class Document(models.Model):
    """
    Modèle pour la table DOCUMENTS
    """
    iddocuments = models.CharField(max_length=255, primary_key=True, db_column='IDDOCUMENTS')
    sync = models.BooleanField(db_column='sync', default=False)
    effacer = models.BooleanField(db_column='effacer', default=False)
    date_synchro = models.DateTimeField(db_column='date_synchro', blank=True, null=True)
    date_modif = models.DateTimeField(db_column='date_modif', blank=True, null=True)
    date_enreg = models.DateTimeField(db_column='date_enreg', blank=True, null=True)
    idutilisateur_save = models.CharField(max_length=255, db_column='IDUTILISATEUR_save', blank=True, null=True)
    titre_document = models.CharField(max_length=255, db_column='titre_document', blank=True, null=True)
    id_client = models.CharField(max_length=255, db_column='ID_Client', blank=True, null=True)
    daterecupserveur = models.DateTimeField(db_column='daterecupserveur', blank=True, null=True)
    
    # Champ pour stocker le fichier (non présent dans le schéma original mais nécessaire)
    fichier = models.FileField(upload_to='documents/clients/', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'documents'
        ordering = ['-date_enreg']

    def __str__(self):
        return self.titre_document or f"Document {self.iddocuments}"
