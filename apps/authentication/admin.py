"""
Configuration de l'admin pour l'application Authentication
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    """Configuration de l'admin pour le modèle Utilisateur"""
    
    list_display = [
        'login_utilisateur', 
        'nom_utilisateur', 
        'role_utilisateur', 
        'code_agence',
        'est_desactiver',
        'is_staff'
    ]
    list_filter = ['role_utilisateur', 'est_desactiver', 'is_staff', 'code_agence']
    search_fields = ['login_utilisateur', 'nom_utilisateur', 'adresse_email']
    ordering = ['nom_utilisateur']
    
    fieldsets = (
        ('Informations de connexion', {
            'fields': ('login_utilisateur', 'password')
        }),
        ('Informations personnelles', {
            'fields': ('nom_utilisateur', 'adresse_email', 'tel_utilisateur')
        }),
        ('Permissions', {
            'fields': ('role_utilisateur', 'is_staff', 'is_active', 'est_desactiver')
        }),
        ('Informations de gestion', {
            'fields': ('code_agence', 'idutilisateur_save')
        }),
        ('Audit', {
            'fields': ('date_enreg', 'date_modif', 'effacer', 'sync', 'date_synchro'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['date_enreg', 'date_modif']
    
    # Configuration pour le formulaire d'ajout (add_form)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('login_utilisateur', 'password'),
        }),
    )
