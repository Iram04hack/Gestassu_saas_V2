from django.db import models

class Contrat(models.Model):
    id_contrat = models.CharField(
        max_length=255, 
        primary_key=True, 
        db_column='id_contrat'
    )
    id_client = models.CharField(
        max_length=255,
        db_column='ID_Client',
        blank=True, 
        null=True
    )
    num_police = models.CharField(
        max_length=255, 
        db_column='numPolice',
        blank=True, 
        null=True
    )
    est_projet = models.BooleanField(
        db_column='estprojet',
        default=False
    )
    effacer = models.BooleanField(
        db_column='effacer',
        default=False
    )
    date_enreg = models.DateTimeField(
        db_column='date_enreg',
        blank=True, 
        null=True
    )

    class Meta:
        managed = False
        db_table = 'contrat'
        ordering = ['-date_enreg']

    def __str__(self):
        return f"Contrat {self.num_police} - {self.id_client}"
