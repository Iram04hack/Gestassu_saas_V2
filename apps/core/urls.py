"""
URLs pour l'application Core
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgenceViewSet, InfoSocieteViewSet

router = DefaultRouter()
router.register(r'agences', AgenceViewSet, basename='agence')
router.register(r'societe', InfoSocieteViewSet, basename='societe')

urlpatterns = [
    path('', include(router.urls)),
]
