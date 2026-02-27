from functools import wraps
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity
from models import db, Utilisateur

auth_bp = Blueprint('auth', __name__)


def auth_required(fn):
    """
    Décorateur de protection des routes.

    - Vérifie la présence et la validité du JWT Bearer token
    - Charge l'utilisateur depuis la BDD et le met dans flask.g (g.current_user)
    - Rejette la requête si le compte n'existe plus en base, même avec un token valide
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({'message': 'Token invalide ou expiré'}), 401

        user = Utilisateur.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({'message': 'Compte introuvable'}), 401

        g.current_user = user
        return fn(*args, **kwargs)

    return wrapper


@auth_bp.post('/api/auth/login')
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email et mot de passe requis'}), 400

    user = Utilisateur.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Identifiants incorrects'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': token, 'user': user.to_dict()})


@auth_bp.post('/api/auth/register')
def register():
    data = request.get_json()
    required = ['prenom', 'nom', 'email', 'password']
    missing = [f for f in required if not data or not data.get(f, '').strip()]
    if missing:
        return jsonify({'message': 'Tous les champs sont obligatoires'}), 400

    if Utilisateur.query.filter_by(email=data['email'].lower().strip()).first():
        return jsonify({'message': 'Un compte avec cet email existe déjà'}), 409

    user = Utilisateur(
        prenom=data['prenom'].strip(),
        nom=data['nom'].strip(),
        email=data['email'].lower().strip(),
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': token, 'user': user.to_dict()}), 201


@auth_bp.get('/api/auth/me')
@auth_required
def me():
    return jsonify(g.current_user.to_dict())
