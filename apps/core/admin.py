"""
Configuration de l'admin pour l'application Core
"""
from django.contrib import admin
from .models import Agence, InfoSociete


@admin.register(Agence)
class AgenceAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour le modèle Agence"""
    
    list_display = ['codeagence', 'nomagence', 'telagence', 'emailagence', 'date_enreg']
    list_filter = ['effacer']
    search_fields = ['codeagence', 'nomagence', 'emailagence']
    ordering = ['nomagence']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('codeagence', 'nomagence')
        }),
        ('Contact', {
            'fields': ('adresseagence', 'telagence', 'emailagence')
        }),
        ('Audit', {
            'fields': ('date_enreg', 'date_modif', 'effacer', 'sync', 'date_synchro'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['date_enreg', 'date_modif']


@admin.register(InfoSociete)
class InfoSocieteAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour le modèle InfoSociete"""
    
    list_display = ['raisonsocial', 'telsociete', 'emailsociete']
    search_fields = ['raisonsocial', 'emailsociete']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('raisonsocial', 'logosociete')
        }),
        ('Contact', {
            'fields': ('adressesociete', 'telsociete', 'emailsociete')
        }),
        ('Détails', {
            'fields': ('bp_courtier', 'fax_courtier', 'basdepage')
        }),
        ('Audit', {
            'fields': ('date_enreg', 'date_modif', 'effacer', 'sync'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['date_enreg', 'date_modif']
