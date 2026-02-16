from django.db import models


class Contrat(models.Model):
    """
    Modèle pour la table Contrat existante
    Représente un contrat d'assurance
    """
    id_contrat = models.CharField(
        max_length=255,
        primary_key=True,
        db_column='id_contrat'
    )
    estprojet = models.BooleanField(
        db_column='estprojet',
        default=False
    )
    numPolice = models.CharField(
        max_length=255,
        db_column='numPolice',
        blank=True,
        null=True
    )
    date_acte = models.DateField(
        db_column='date_acte',
        blank=True,
        null=True
    )
    date_effet = models.DateField(
        db_column='date_effet',
        blank=True,
        null=True
    )
    Date_echeance = models.DateField(
        db_column='Date_echeance',
        blank=True,
        null=True
    )
    duree_contrat = models.IntegerField(
        db_column='duree_contrat',
        blank=True,
        null=True
    )
    ID_Client = models.CharField(
        max_length=255,
        db_column='ID_Client',
        blank=True,
        null=True
    )
    # Relation avec Produit
    produit = models.ForeignKey(
        'produits.Produit',
        on_delete=models.DO_NOTHING,
        db_column='Id_produit',
        blank=True,
        null=True,
        related_name='contrats'
    )
    # Champ Id_produit conservé pour compatibilité ou accès direct si besoin (optionnel, la FK le remplace)
    # Mais comme c'est db_column, la FK suffit. On peut accéder à l'ID via produit_id
    
    prime_nette_brute = models.IntegerField(
        db_column='prime_nette_brute',
        blank=True,
        null=True
    )
    reductions = models.CharField(
        max_length=255,
        db_column='reductions',
        blank=True,
        null=True
    )
    prime_net_red = models.IntegerField(
        db_column='prime_net_red',
        blank=True,
        null=True
    )
    # Relation avec Compagnie
    compagnie = models.ForeignKey(
        'compagnies.Compagnie',
        on_delete=models.DO_NOTHING,
        db_column='Id_compagnie',
        blank=True,
        null=True,
        related_name='contrats'
    )
    accessoires = models.IntegerField(
        db_column='accessoires',
        blank=True,
        null=True
    )
    taxe = models.IntegerField(
        db_column='taxe',
        blank=True,
        null=True
    )
    CEMAC = models.IntegerField(
        db_column='CEMAC',
        blank=True,
        null=True
    )
    CSS = models.IntegerField(
        db_column='CSS',
        blank=True,
        null=True
    )
    TSVL = models.IntegerField(
        db_column='TSVL',
        blank=True,
        null=True
    )
    CCA = models.IntegerField(
        db_column='CCA',
        blank=True,
        null=True
    )
    prime_totale = models.IntegerField(
        db_column='prime_totale',
        blank=True,
        null=True
    )
    montant_reductions = models.IntegerField(
        db_column='montant_reductions',
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
    IDUTILISATEUR_save = models.CharField(
        max_length=255,
        db_column='IDUTILISATEUR_save',
        blank=True,
        null=True
    )
    date_enreg = models.DateTimeField(
        db_column='date_enreg',
        blank=True,
        null=True
    )
    date_modif = models.DateTimeField(
        db_column='date_modif',
        blank=True,
        null=True
    )
    nature_contrat = models.CharField(
        max_length=255,
        db_column='nature_contrat',
        blank=True,
        null=True
    )
    type_doc = models.CharField(
        max_length=255,
        db_column='type_doc',
        blank=True,
        null=True
    )
    attestation_jaune = models.CharField(
        max_length=255,
        db_column='attestation_jaune',
        blank=True,
        null=True
    )
    attestation_rose = models.CharField(
        max_length=255,
        db_column='attestation_rose',
        blank=True,
        null=True
    )
    commission_courtier = models.IntegerField(
        db_column='commission_courtier',
        blank=True,
        null=True
    )
    CodeAgence = models.CharField(
        max_length=255,
        db_column='CodeAgence',
        blank=True,
        null=True
    )
    numAvenant = models.CharField(
        max_length=255,
        db_column='numAvenant',
        blank=True,
        null=True
    )
    code_apporteur = models.CharField(
        max_length=255,
        db_column='code_apporteur',
        blank=True,
        null=True
    )
    taux_com_apporteur = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='taux_com_apporteur',
        blank=True,
        null=True
    )
    montant_com_apporteur = models.IntegerField(
        db_column='montant_com_apporteur',
        blank=True,
        null=True
    )
    type_contrat = models.CharField(
        max_length=255,
        db_column='type_contrat',
        blank=True,
        null=True
    )
    surprime_taux = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='surprime_taux',
        blank=True,
        null=True
    )
    surprime_fixe = models.IntegerField(
        db_column='surprime_fixe',
        blank=True,
        null=True
    )
    montant_surprime = models.IntegerField(
        db_column='montant_surprime',
        blank=True,
        null=True
    )
    fractionnement = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='fractionnement',
        blank=True,
        null=True
    )
    daterecupserveur = models.DateTimeField(
        db_column='daterecupserveur',
        blank=True,
        null=True
    )
    est_suspendu = models.BooleanField(
        db_column='est_suspendu',
        default=False
    )
    date_debut_suspension = models.DateField(
        db_column='date_debut_suspension',
        blank=True,
        null=True
    )
    date_fin_suspension = models.DateField(
        db_column='date_fin_suspension',
        blank=True,
        null=True
    )
    Motif_avenant = models.CharField(
        max_length=255,
        db_column='Motif_avenant',
        blank=True,
        null=True
    )
    duree_paiement = models.IntegerField(
        db_column='duree_paiement',
        blank=True,
        null=True
    )
    frequence_paiement = models.CharField(
        max_length=255,
        db_column='frequence_paiement',
        blank=True,
        null=True
    )
    observation = models.TextField(
        db_column='observation',
        blank=True,
        null=True
    )
    piece_justif = models.CharField(
        max_length=255,
        db_column='piece_justif',
        blank=True,
        null=True
    )
    est_resilier = models.BooleanField(
        db_column='est_resilier',
        default=False
    )
    date_resiliation = models.DateField(
        db_column='date_resiliation',
        blank=True,
        null=True
    )
    prime_ristone = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='prime_ristone',
        blank=True,
        null=True
    )
    numPolice_assureur = models.CharField(
        max_length=255,
        db_column='numPolice_assureur',
        blank=True,
        null=True
    )
    generation_auto_cotisation = models.BooleanField(
        db_column='generation_auto_cotisation',
        default=False
    )

    class Meta:
        managed = False
        db_table = 'contrat'
        ordering = ['-date_enreg']

    def __str__(self):
        return f"Contrat {self.numPolice} - {self.ID_Client}"


class Risques(models.Model):
    """
    Modèle pour la table Risques existante
    Stocke les détails des risques (Véhicules, Bâtiments, etc.)
    """
    id_risque = models.CharField(max_length=255, primary_key=True, db_column='id_risque')
    type_risque = models.CharField(max_length=255, db_column='type_risque', blank=True, null=True)
    designation_risque = models.CharField(max_length=255, db_column='designation_risque', blank=True, null=True)
    
    # Champs Véhicule
    veh_marque = models.CharField(max_length=255, db_column='veh_marque', blank=True, null=True)
    veh_modele = models.CharField(max_length=255, db_column='veh_modele', blank=True, null=True)
    veh_immat = models.CharField(max_length=255, db_column='veh_immat', blank=True, null=True)
    veh_chassis = models.CharField(max_length=255, db_column='veh_chassis', blank=True, null=True)
    veh_type = models.CharField(max_length=255, db_column='veh_type', blank=True, null=True)
    veh_puissance = models.CharField(max_length=255, db_column='veh_puissance', blank=True, null=True)
    veh_nbplace = models.IntegerField(db_column='veh_nbplace', blank=True, null=True)
    
    # Champs audit
    effacer = models.BooleanField(db_column='effacer', default=False)
    sync = models.BooleanField(db_column='sync', default=False)
    date_enreg = models.DateTimeField(db_column='date_enreg', blank=True, null=True)
    date_modif = models.DateTimeField(db_column='date_modif', blank=True, null=True)
    idutilisateur_save = models.CharField(max_length=255, db_column='IDUTILISATEUR_save', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'risques'

    def __str__(self):
        return self.designation_risque or self.veh_immat or self.id_risque


class ContratRisques(models.Model):
    """
    Table de liaison entre Contrat et Risques
    """
    id_risque = models.CharField(max_length=255, primary_key=True, db_column='Id_risque')
    id_contrat = models.CharField(max_length=255, db_column='Id_contrat', blank=True, null=True)
    
    # Liens attestations
    attestation_jaune = models.CharField(max_length=255, db_column='attestation_jaune', blank=True, null=True)
    attestation_rose = models.CharField(max_length=255, db_column='attestation_rose', blank=True, null=True)
    
    # Champs audit
    effacer = models.BooleanField(db_column='effacer', default=False)
    sync = models.BooleanField(db_column='sync', default=False)
    date_modif = models.DateTimeField(db_column='date_modif', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'contrat_risques'

    def __str__(self):
        return f"Lien {self.id_contrat} - {self.id_risque}"

