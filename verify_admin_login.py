import os
import sys
import django
from django.conf import settings

PROJECT_ROOT = 'c:/projets_django/Gestassu_saas_V2'
sys.path.append(PROJECT_ROOT)
sys.path.append(os.path.join(PROJECT_ROOT, 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from apps.authentication.views import login_view

def test_admin_login_variations():
    print("Testing Admin Login Variations...")
    factory = APIRequestFactory()
    
    # 1. Correct Password
    print("\n1. Correct Password 'Yodi@2026':")
    request = factory.post('/api/auth/login/', {'login': 'admin', 'password': 'Yodi@2026'}, format='json')
    response = login_view(request)
    print(f"Status: {response.status_code}") # Expect 200
    
    # 2. Capitalized Username
    print("\n2. Capitalized Username 'Admin' with correct password:")
    request = factory.post('/api/auth/login/', {'login': 'Admin', 'password': 'Yodi@2026'}, format='json')
    response = login_view(request)
    print(f"Status: {response.status_code}") # Expect 200 if iexact works

if __name__ == '__main__':
    test_admin_login_variations()
