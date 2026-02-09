"""
URLs pour l'authentification
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    login_view,
    logout_view,
    current_user_view,
    CustomTokenObtainPairView,
    ChangePasswordView,
)

urlpatterns = [
    # Authentication
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('me/', current_user_view, name='current-user'),
    
    # JWT Token
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
