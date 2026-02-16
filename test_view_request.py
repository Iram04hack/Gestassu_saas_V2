import os
import sys
import django
from django.conf import settings

# Setup Django environment similar to manage.py
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# from apps.authentication.models import Utilisateur # Avoid importing this
from apps.finances.views import TypeMouvementViewSet
from rest_framework.test import force_authenticate

# Fix console encoding
sys.stdout.reconfigure(encoding='utf-8')

print("Starting view test...")

try:
    factory = APIRequestFactory()
    view = TypeMouvementViewSet.as_view({'get': 'list'})
    
    # Create a request
    request = factory.get('/api/finances/types-mouvements/?search=')
    
    # Create a mock user
    class MockUser:
        is_authenticated = True
        username = 'test'
    
    user = MockUser()
    force_authenticate(request, user=user)
    
    print("Calling view...")
    response = view(request)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 500:
        print("500 Error reproduced!")
    else:
        print("Success!")
        print(response.data)

except Exception as e:
    import traceback
    print("EXCEPTION CAUGHT:")
    traceback.print_exc()
