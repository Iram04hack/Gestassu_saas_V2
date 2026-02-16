from django.db import models

class Apporteur(models.Model):
    """
    Modèle pour les apporteurs d'affaires / commerciaux
    """
    code_apporteur = models.CharField(
        max_length=255, 
        primary_key=True, 
        db_column='ID_Commercial',
        verbose_name='Référence'
    )
    nom_apporteur = models.CharField(
        max_length=255, 
        db_column='Nom_Raison_Sociale',
        verbose_name='Nom / Raison Sociale'
    )
    type_apporteur = models.CharField(
        max_length=255, 
        db_column='Type_Commercial',
        verbose_name='Type'
    )
    adresse = models.CharField(
        max_length=255, 
        db_column='Adresse', 
        blank=True, 
        null=True
    )
    email = models.EmailField(
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
    date_naissance = models.DateField(
        db_column='Date_naissance', 
        blank=True, 
        null=True
    )
    nif_rccm = models.CharField(
        max_length=255, 
        db_column='NIF_RCCM', 
        blank=True, 
        null=True,
        verbose_name='NIF / RCCM'
    )
    num_piece_identite = models.CharField(
        max_length=255, 
        db_column='Numero_Piece_Identite', 
        blank=True, 
        null=True
    )
    date_entree = models.DateField(
        db_column='Date_Embauche', 
        blank=True, 
        null=True,
        verbose_name="Date d'entrée en relation"
    )
    frequence_paiement = models.CharField(
        max_length=50, 
        db_column='Frequence_paiement', 
        blank=True, 
        null=True,
        choices=[
            ('Mensuel', 'Mensuel'),
            ('Trimestriel', 'Trimestriel'),
            ('Semestriel', 'Semestriel'),
            ('Annuel', 'Annuel')
        ]
    )
    login = models.CharField(
        max_length=255, 
        db_column='login_commercial', 
        blank=True, 
        null=True
    )
    mot_de_passe = models.CharField(
        max_length=255, 
        db_column='mdp_commercial', 
        blank=True, 
        null=True
    )
    
    # Audit
    effacer = models.BooleanField(
        db_column='effacer', 
        default=False
    )
    date_enreg = models.DateTimeField(
        db_column='date_enreg', 
        auto_now_add=True, 
        blank=True, 
        null=True
    )
    
    class Meta:
        managed = False
        db_table = 'commerciaux'
        verbose_name = 'Apporteur'
        verbose_name_plural = 'Apporteurs'
        ordering = ['nom_apporteur']

    def __str__(self):
        return f"{self.nom_apporteur} ({self.code_apporteur})"


class CommissionApporteur(models.Model):
    """
    Configuration des commissions par apporteur et produit
    """
    id_commission = models.AutoField(
        primary_key=True,
        db_column='IDCOMMISSIONS_COMMERCIAL'
    )
    
    code_apporteur = models.ForeignKey(
        'Apporteur',
        on_delete=models.CASCADE,
        to_field='code_apporteur',
        db_column='code_apporteur',
        related_name='commissions',
        db_constraint=False
    )
    type_contrat = models.CharField(
        max_length=255,
        db_column='type_contrat',
        verbose_name='Type de contrat'
    )
    mode_remuneration = models.CharField(
        max_length=50,
        db_column='mode_remuneration',
        choices=[
            ('fixe', 'Commission fixe'),
            ('pourcentage', 'Pourcentage')
        ],
        default='pourcentage'
    )
    taux_commission = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        db_column='taux_commission',
        default=0
    )
    commission_fixe = models.IntegerField(
        db_column='commission_fixe',
        default=0
    )
    
    # Audit
    effacer = models.BooleanField(
        db_column='effacer', 
        default=False
    )
    date_enreg = models.DateTimeField(
        db_column='date_enreg', 
        auto_now_add=True
    )

    class Meta:
        managed = True
        verbose_name = 'Commission Apporteur'

