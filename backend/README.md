# Projet-Sante Backend

Ceci est le backend du projet Santé, développé avec Flask.

## Structure du projet

- `app.py`: Point d'entrée de l'application.
- `routes/`: Contient les blueprints pour l'authentification (`auth.py`) et d'autres fonctionnalités (`ots.py`).
- `models.py`: Définitions des modèles de base de données SQLAlchemy.
- `config.py`: Configuration de l'application.
- `init_db.py`: Script pour initialiser la base de données.
- `schema.sql`: Schéma SQL de la base de données.

## Installation

1. Créer un environnement virtuel :
   ```bash
   python -m venv venv
   ```

2. Activer l'environnement virtuel :
   - Linux/macOS : `source venv/bin/bin/activate`
   - Windows : `venv\Scripts\activate`

3. Installer les dépendances :
   ```bash
   pip install -r requirements.txt
   ```

4. Configurer les variables d'environnement :
   Copier `.env.example` vers `.env` et remplir les valeurs nécessaires.

## Utilisation

Pour lancer l'application :
```bash
flask run
```
ou
```bash
python app.py
```

## Base de données

Pour initialiser la base de données :
```bash
python init_db.py
```
