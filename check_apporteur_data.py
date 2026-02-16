import os
import django
import sys

# Add project root to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Use proper import based on sys.path and INSTALLED_APPS
try:
    from commerciaux.models import Apporteur
except ImportError:
    from apps.commerciaux.models import Apporteur

print(f"Counting Apporteurs...")
try:
    count = Apporteur.objects.count()
    print(f"Total: {count}")
    
    active = Apporteur.objects.filter(effacer=False)
    print(f"Active: {active.count()}")
    
    if active.exists():
        print("Sample data:")
        for a in active[:3]:
            # Use getattr to be safe if fields are different
            code = getattr(a, 'code_apporteur', 'N/A')
            nom = getattr(a, 'nom_apporteur', 'N/A')
            type_app = getattr(a, 'type_apporteur', 'N/A')
            print(f"- {code}: {nom} ({type_app})")
    else:
        print("No active apporteurs found.")
        
except Exception as e:
    print(f"Error: {e}")
