import os
import django
from django.db import connection
import sys

# Add project root to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def drop_table():
    print("Dropping table commerciaux_commissionapporteur...")
    with connection.cursor() as cursor:
        try:
            cursor.execute("DROP TABLE IF EXISTS commerciaux_commissionapporteur")
            print("Table dropped.")
        except Exception as e:
            print(f"Error: {e}")

drop_table()
