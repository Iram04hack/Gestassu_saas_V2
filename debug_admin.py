import os
import sys
import django
from django.conf import settings

# Add project root and apps to sys.path
PROJECT_ROOT = 'c:/projets_django/Gestassu_saas_V2'
sys.path.append(PROJECT_ROOT)
sys.path.append(os.path.join(PROJECT_ROOT, 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.apps import apps
from django.contrib.auth.hashers import check_password

def check_admin_user():
    Utilisateur = apps.get_model('authentication', 'Utilisateur')
    
    login_to_check = 'admin'
    password_to_check = 'Yodi@2026'
    
    print(f"Checking for user with login: '{login_to_check}'")
    
    user = Utilisateur.objects.filter(login_utilisateur=login_to_check).first()
    
    if not user:
        print(f"User '{login_to_check}' NOT FOUND.")
        # Try finding a user who looks like admin?
        admins = Utilisateur.objects.filter(login_utilisateur__icontains='admin')
        print(f"Users containing 'admin': {[u.login_utilisateur for u in admins]}")
        return

    print(f"User found: {user.login_utilisateur} (ID: {user.idutilisateur})")
    print(f"Stored Password Hash: {user.password}")
    
    # Check password
    is_valid = user.check_password(password_to_check)
    print(f"Check password '{password_to_check}': {is_valid}")
    
    if is_valid:
        print("PASS: The password is correct.")
    else:
        print("FAIL: The password does NOT match the stored hash.")
        
        # Test if we can set it and it works (simulation)
        # We won't save it, just check if hashing works as expected
        user.set_password(password_to_check)
        print(f"New Hash for '{password_to_check}': {user.password}")
        print(f"Check new hash: {user.check_password(password_to_check)}")

if __name__ == '__main__':
    check_admin_user()
