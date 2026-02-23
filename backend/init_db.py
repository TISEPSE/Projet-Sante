"""
Script d'initialisation de la base de données.
Crée les tables SQLAlchemy.

Usage:
    python init_db.py
"""
from app import create_app
from models import db


def init():
    app = create_app()
    with app.app_context():
        db.create_all()
        print('Tables créées.')


if __name__ == '__main__':
    init()
