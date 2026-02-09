# Gestassu SaaS

Projet de gestion d'assurance SaaS.

## Structure du Projet

- `apps/` : Applications Django (CRM, Contrats, Finances, etc.)
- `config/` : Configuration globale de Django.
- `frontend/` : Application React (Vite).

## Installation

### 1. Backend (Django)

1. Créer un environnement virtuel :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows: venv\Scripts\activate
   ```
2. Installer les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
3. Configurer l'environnement :
   - Copier `.env.example` vers `.env`.
   - Remplir les informations de connexion à la base de données dans `.env`.
4. Lancer les migrations :
   ```bash
   python manage.py migrate
   ```
5. Lancer le serveur :
   ```bash
   python manage.py runserver
   ```

### 2. Frontend (React + Vite)

1. Aller dans le dossier frontend :
   ```bash
   cd frontend
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## Collaboration

Pour travailler sur ce projet :
1. Cloner le dépôt.
2. Basculer sur votre branche de travail (ex: `amir-work`).
3. Avant de commencer, assurez-vous de faire un `git pull` pour avoir les dernières mises à jour.
