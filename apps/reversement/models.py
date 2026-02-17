from django.db import models

class Reversement(models.Model):
    idgroupereversement = models.CharField(max_length=50, primary_key=True)
    montant_reverse_total = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    datereversement = models.DateTimeField(null=True, blank=True)
    date_enreg = models.DateTimeField(auto_now_add=True, null=True)
    effacer = models.BooleanField(default=False)
    lib_reversement = models.CharField(max_length=255, null=True, blank=True)
    id_compagnie = models.CharField(max_length=50, null=True, blank=True, db_column='Id_compagnie') # Attention à la casse
    num_ordre_rev = models.CharField(max_length=50, null=True, blank=True)
    periode_rev = models.CharField(max_length=100, null=True, blank=True)
    est_valide = models.BooleanField(default=False)
    commission_genere = models.IntegerField(null=True, blank=True, db_column='Commission_genere')

    class Meta:
        db_table = 'reversement'
        managed = False  # On ne gère pas la création de la table

class ReversementReglement(models.Model):
    idregle_rev = models.CharField(max_length=50, primary_key=True)
    date_reglement = models.DateTimeField(null=True, blank=True)
    date_enreg = models.DateTimeField(auto_now_add=True, null=True)
    effacer = models.BooleanField(default=False)
    sync = models.BooleanField(default=False)
    date_synchro = models.DateTimeField(null=True, blank=True)
    idutilisateur_save = models.CharField(max_length=50, null=True, blank=True, db_column='IDUTILISATEUR_save')
    idgroupereversement = models.CharField(max_length=50, null=True, blank=True, db_column='Idgroupereversement')
    observation_reglement = models.TextField(null=True, blank=True, db_column='Observation_reglement')
    montant_regle = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, db_column='Montant_Regle')
    mode_versement = models.CharField(max_length=50, null=True, blank=True, db_column='Mode_versement')
    daterecupserveur = models.DateTimeField(null=True, blank=True)
    idmouvement = models.CharField(max_length=50, null=True, blank=True)

    # Alias pour compatibilité avec le reste du code
    @property
    def date_regle(self):
        return self.date_reglement
    
    @property
    def mode_reglement(self):
        return self.mode_versement
        
    @property
    def ref_reglement(self):
        return self.observation_reglement or "N/A"

    class Meta:
        db_table = 'reversement_reglement'
        managed = False
