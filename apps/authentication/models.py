"""
Modèles d'authentification pour Gestassu
Basés sur la table UTILISATEUR existante dans MySQL
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UtilisateurManager(BaseUserManager):
    """Manager personnalisé pour le modèle Utilisateur"""
    
    def create_user(self, login_utilisateur, password=None, **extra_fields):
        """Créer et sauvegarder un utilisateur"""
        if not login_utilisateur:
            raise ValueError('Le login est obligatoire')
        
        user = self.model(login_utilisateur=login_utilisateur, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, login_utilisateur, password=None, **extra_fields):
        """Créer un superutilisateur"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role_utilisateur', 'ADMIN')
        
        return self.create_user(login_utilisateur, password, **extra_fields)


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    """
    Modèle Utilisateur personnalisé basé sur la table UTILISATEUR existante
    
    IMPORTANT: managed = False pour ne pas modifier la table existante
    """
    
    # Champs de la table UTILISATEUR
    idutilisateur = models.CharField(
        max_length=255, 
        primary_key=True, 
        db_column='IDUTILISATEUR',
        verbose_name='ID Utilisateur'
    )
    nom_utilisateur = models.CharField(
        max_length=255, 
        db_column='Nom_utilisateur',
        verbose_name='Nom'
    )
    adresse_email = models.EmailField(
        max_length=255, 
        blank=True, 
        null=True, 
        db_column='Adresse_email',
        verbose_name='Email'
    )
    password = models.CharField(
        max_length=255, 
        db_column='Mot_de_passe',
        verbose_name='Mot de passe'
    )
    
    tel_utilisateur = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        db_column='Tel_utilisateur',
        verbose_name='Téléphone'
    )
    role_utilisateur = models.CharField(
        max_length=255, 
        db_column='Role_utilisateur',
        verbose_name='Rôle'
    )
    login_utilisateur = models.CharField(
        max_length=255, 
        unique=True, 
        db_column='login_utilisateur',
        verbose_name='Login'
    )
    
    # Champs d'audit (synchronisation avec ancienne app desktop)
    effacer = models.BooleanField(
        default=False,
        verbose_name='Supprimé'
    )
    sync = models.BooleanField(
        default=False,
        verbose_name='Synchronisé'
    )
    date_synchro = models.DateTimeField(
        blank=True, 
        null=True,
        verbose_name='Date synchronisation'
    )
    date_modif = models.DateTimeField(
        auto_now=True,
        verbose_name='Date modification'
    )
    date_enreg = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date enregistrement'
    )
    est_desactiver = models.BooleanField(
        default=False,
        verbose_name='Désactivé'
    )
    daterecupserveur = models.DateTimeField(
        blank=True, 
        null=True,
        verbose_name='Date récupération serveur'
    )
    
    # Relations
    code_agence = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        db_column='CodeAgence',
        verbose_name='Code agence'
    )
    idutilisateur_save = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        db_column='IDUTILISATEUR_save',
        verbose_name='Enregistré par'
    )
    
    # Champs Django requis (AJOUTÉS À LA DB)
    last_login = models.DateTimeField(
        blank=True, 
        null=True, 
        verbose_name='Dernière connexion'
    )
    is_superuser = models.BooleanField(
        default=False,
        verbose_name='Superutilisateur'
    )
    is_staff = models.BooleanField(
        default=False,
        verbose_name='Staff'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Actif'
    )
    
    objects = UtilisateurManager()
    
    USERNAME_FIELD = 'login_utilisateur'
    REQUIRED_FIELDS = ['nom_utilisateur']
    
    class Meta:
        db_table = 'utilisateur'  # Correction: minuscules
        managed = False
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['nom_utilisateur']
    
    def __str__(self):
        return self.nom_utilisateur
    
    def get_full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        return self.nom_utilisateur
    
    def get_short_name(self):
        """Retourne le nom court de l'utilisateur"""
        return self.login_utilisateur
    
    @property
    def is_admin(self):
        """Vérifie si l'utilisateur est administrateur"""
        return self.role_utilisateur == 'ADMIN'
