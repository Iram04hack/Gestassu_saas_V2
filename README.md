# Gestassu - Application Web de Courtage d'Assurance

Application web moderne développée avec **Django** (backend) et **React** (frontend) pour la gestion complète d'un courtage d'assurance.

## 🎯 Fonctionnalités

- **Tableau de bord** - Vue d'ensemble et KPIs
- **CRM** - Gestion clients et interactions
- **Compagnies** - Gestion des partenaires assurance
- **Catalogue** - Produits et tarifs
- **Contrats** - Gestion complète des contrats
- **Finances** - Caisses et mouvements financiers
- **Reversement** - Reversements aux compagnies
- **Sinistres** - Déclaration et suivi
- **Commerciaux** - Gestion des apporteurs et commissions

## 📂 Structure du Projet

Le projet backend est organisé pour séparer clairement la configuration des applications métier :

```
gestassu_saas/
├── apps/                   # Applications métier
│   ├── authentication/     # Gestion utilisateurs (JWT)
│   ├── core/               # Utilitaires communs
│   ├── crm/                # Clients, Agenda
│   ├── contrats/           # Polices d'assurance
│   ├── ...                 # (produits, finances, etc.)
├── config/                 # Configuration Django
├── media/                  # Fichiers utilisateurs
├── static/                 # Fichiers statiques
└── manage.py
```

## 🛠️ Technologies

- **Backend** : Django 4.2 + Django REST Framework
- **Frontend** : React + Bootstrap (à venir)
- **Base de données** : MySQL (Remote)
- **Authentication** : JWT (Simple JWT)

## 📦 Installation & Démarrage

### 1. Prérequis
- Python 3.9+
- MySQL Client (`libmysqlclient-dev` sur Linux/Mac)
- Node.js 16+ (pour le frontend)

### 2. Configuration Backend

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement
# Windows:
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer le .env
# Assurez-vous que le fichier .env contient les bons identifiants DB

# Lancer les migrations
python manage.py migrate

# Lancer le serveur
python manage.py runserver
```

### 3. Authentification & Sécurité

L'API est sécurisée par JWT.

#### Endpoints Principaux
-   **Login** : `POST /api/auth/token/`
    -   Payload : `{"login_utilisateur": "admin", "password": "..."}`
-   **Utilisateur Courant** : `GET /api/auth/me/`
    -   Header : `Authorization: Bearer <token>`
-   **Changer Mot de Passe / ID** : `PUT /api/auth/change-password/`
    -   Header : `Authorization: Bearer <token>`
    -   Payload : 
        ```json
        {
            "old_password": "ancien_password",
            "new_password": "nouveau_password_securise",
            "new_login": "nouveau_login_optionnel"
        }
        ```

> **⚠️ Note Importante**: Les mots de passe de la base existante ne sont pas compatibles. Il faut réinitialiser le mot de passe initial (via admin) puis utiliser l'endpoint de changement de mot de passe.

### 4. Dépannage

**Erreur `OperationalError: Illegal mix of collations`** :
Si vous rencontrez cette erreur dans l'interface admin, c'est que la "collation" de la base distante diffère de celle attendue par le driver.
-> Le projet est configuré pour forcer `utf8mb4_unicode_ci` dans `settings.py`.

## 📝 License

Propriétaire - Tous droits réservés
