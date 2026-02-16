import os
import sys
import django

# Setup Django environment
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from finances.models import TypeMouvementManuel

# Fix console encoding
sys.stdout.reconfigure(encoding='utf-8')

print("Checking for hidden records in TypeMouvementManuel...")
hidden_records = TypeMouvementManuel.objects.filter(effacer=True)
count = hidden_records.count()

if count > 0:
    print(f"Found {count} hidden records. Restoring...")
    for obj in hidden_records:
        print(f"Restoring: {obj.lib_type_mouvement} (ID: {obj.id_type_mvt})")
        obj.effacer = False
        obj.save()
    print("Restoration complete.")
else:
    print("No hidden records found.")
