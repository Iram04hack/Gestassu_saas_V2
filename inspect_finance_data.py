import os
import sys
import django
from django.db import connection

# Setup Django environment
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from finances.models import TypeMouvementManuel

# Fix console encoding
sys.stdout.reconfigure(encoding='utf-8')

def count_table(table_name):
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            return cursor.fetchone()[0]
        except Exception as e:
            return f"Error: {e}"

def count_effacer_null(table_name):
    with connection.cursor() as cursor:
        try:
            # Check if column exists first? 
            # Assuming schema.sql is correct, Effacer column exists.
            cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE Effacer IS NULL")
            return cursor.fetchone()[0]
        except Exception:
            return "N/A"

print("Inspecting Finance Tables...")

# List TypeMouvementManuel content
with open('inspect_results.txt', 'w', encoding='utf-8') as f:
    f.write("--- TypeMouvementManuel Content ---\n")
    for obj in TypeMouvementManuel.objects.all():
        line = f"ID: {obj.id_type_mvt}, Lib: {obj.lib_type_mouvement}, Effacer: {obj.effacer}, TypeOp: {obj.type_op}\n"
        f.write(line)
        print(line.strip())

    f.write("\n--- TypeMouvementAutomatique Content (First 5) ---\n")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT IDTYPE_MVT, LibType_Mouvement FROM type_mvt_automatique LIMIT 5")
            rows = cursor.fetchall()
            for row in rows:
                f.write(str(row) + "\n")
                print(row)
    except Exception as e:
        f.write(str(e) + "\n")
        print(e)

