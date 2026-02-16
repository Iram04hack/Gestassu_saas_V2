import os
import django
from django.db import connection
import sys

# Add project root to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def check_table(table_name):
    print(f"Checking table '{table_name}'...")
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row = cursor.fetchone()
            print(f"  Count: {row[0]}")
            
            if row[0] > 0:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
                columns = [col[0] for col in cursor.description]
                print(f"  Columns: {columns}")
        except Exception as e:
            print(f"  Error: {e}")

check_table('apporteur')
check_table('COMMERCIAUX')
check_table('commerciaux')
