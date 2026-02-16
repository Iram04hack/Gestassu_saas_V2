import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from finances.models import TypeMouvementManuel
from django.db import connection

# Fix console encoding
sys.stdout.reconfigure(encoding='utf-8')

print("Checking table existence...")
table_name = TypeMouvementManuel._meta.db_table
print(f"Model expects table: {table_name}")

with connection.cursor() as cursor:
    cursor.execute("SHOW TABLES LIKE %s", [table_name])
    row = cursor.fetchone()
    if row:
        print(f"Table '{table_name}' EXISTS.")
        
        print(f"Inspecting columns for '{table_name}':")
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        columns = cursor.fetchall()
        for col in columns:
            print(f"Column: {col[0]} Type: {col[1]}")
            
        print("\nTesting filter(effacer=False)...")
        try:
            # Force SELECT of columns
            print("Attempting to fetch objects (forcing SELECT)...")
            objs = list(TypeMouvementManuel.objects.all()[:1])
            print(f"Fetch successful. Objects found: {len(objs)}")
            
            if len(objs) > 0:
                obj = objs[0]
                print(f"First object: {obj}")
                print(f"ID Type: {type(obj.id_type_mvt)} Value: {obj.id_type_mvt}")
                print(f"Lib Type: {type(obj.lib_type_mouvement)} Value: {obj.lib_type_mouvement}")
                print(f"Type Op: {type(obj.type_op)} Value: {obj.type_op}")
                print(f"Effacer: {type(obj.effacer)} Value: {obj.effacer}")
                
            # Check for serialization issues
                from finances.serializers import TypeMouvementSerializer
                serializer = TypeMouvementSerializer(obj)
                print(f"Serialized data: {serializer.data}")

            # Insert a TEST record
            print("\nAttempting to INSERT a test record...")
            import uuid
            new_id = str(uuid.uuid4())
            new_obj = TypeMouvementManuel.objects.create(
                id_type_mvt=new_id,
                lib_type_mouvement="TEST AUTOMATIQUE",
                type_op=False,
                effacer=False
            )
            print(f"Created object: {new_obj} with ID: {new_id}")

            count = TypeMouvementManuel.objects.filter(effacer=False).count()
            print(f"Filter successful after insert. Count: {count}")
            
            # Try fetching one
            if count > 0:
                obj = TypeMouvementManuel.objects.first()
                print(f"First object: {obj}")
                print(f"ID Type: {type(obj.id_type_mvt)} Value: {obj.id_type_mvt}")
                print(f"Lib Type: {type(obj.lib_type_mouvement)} Value: {obj.lib_type_mouvement}")
                
        except Exception as e:
            print(f"Filter/Query FAILED: {e}")
            
    else:
        print(f"Table '{table_name}' DOES NOT EXIST.")
        
        # List all tables
        print("Listing all tables like '%mvt%'...")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        for t in tables:
            if 'mvt' in t[0].lower() or 'type' in t[0].lower():
                print(f"Found candidate: {t[0]}")
