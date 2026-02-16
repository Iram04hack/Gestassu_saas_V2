import os
import django
from django.db import connection
import sys

# Add project root to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def get_columns(table_name):
    print(f"--- Columns for {table_name} ---")
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"DESCRIBE {table_name}")
            rows = cursor.fetchall()
            for row in rows:
                print(f"{row[0]} ({row[1]})")
        except Exception as e:
            print(f"Error: {e}")

get_columns('COMMERCIAUX')
