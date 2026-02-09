from django.db import models

class Quittance(models.Model):
    id_quittance = models.CharField(
        max_length=255, 
        primary_key=True, 
        db_column='idquittance'
    )
    id_contrat = models.CharField(
        max_length=255,
        db_column='Id_contrat',
        blank=True, 
        null=True
    )
    num_quittance = models.CharField(
        max_length=255, 
        db_column='numquittance',
        blank=True, 
        null=True
    )
    prime_totale = models.IntegerField(
        db_column='prime_totale',
        blank=True, 
        null=True
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
        db_table = 'quittance'
        ordering = ['-date_enreg']

    def __str__(self):
        return f"Quittance {self.num_quittance} - {self.prime_totale}"
