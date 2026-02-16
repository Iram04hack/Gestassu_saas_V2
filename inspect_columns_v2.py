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
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
            
            # Print column names
            if cursor.description:
                for col in cursor.description:
                    print(col[0])
            else:
                print("No description returned.")
                
        except Exception as e:
            print(f"Error: {e}")

get_columns('commissions_commercial')
