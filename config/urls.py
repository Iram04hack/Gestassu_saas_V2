"""
Configuration des URLs principales du projet Gestassu
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),
    
    # API Authentication
    path('api/auth/', include('authentication.urls')),
    
    # API Core
    path('api/core/', include('core.urls')),
    
    # API Modules
    path('api/crm/', include('crm.urls')),
    path('api/compagnies/', include('compagnies.urls')),
    path('api/contrats/', include('contrats.urls')),
    path('api/produits/', include('produits.urls')),
    path('api/finances/', include('finances.urls')),
    
    # Autres APIs (à ajouter progressivement):
    # path('api/reversement/', include('reversement.urls')),
    # path('api/sinistres/', include('sinistres.urls')),
    # path('api/commerciaux/', include('commerciaux.urls')),
    # path('api/dashboard/', include('dashboard.urls')),
    # path('api/statistiques/', include('statistiques.urls')),
]

# Configuration pour servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
