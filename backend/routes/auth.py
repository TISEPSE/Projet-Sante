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
    required = ['prenom', 'nom', 'email', 'password', 'role']
    missing = [f for f in required if not data or not data.get(f, '').strip()]
    if missing:
        return jsonify({'message': 'Tous les champs sont obligatoires'}), 400

    if data['role'] not in ('responsable', 'developpeur'):
        return jsonify({'message': 'Rôle invalide'}), 400

    if Utilisateur.query.filter_by(email=data['email'].lower().strip()).first():
        return jsonify({'message': 'Un compte avec cet email existe déjà'}), 409

    user = Utilisateur(
        prenom=data['prenom'].strip(),
        nom=data['nom'].strip(),
        email=data['email'].lower().strip(),
        role=data['role'],
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


@auth_bp.get('/api/users')
@auth_required
def list_users():
    users = Utilisateur.query.order_by(Utilisateur.nom, Utilisateur.prenom).all()
    return jsonify([u.to_dict() for u in users])


@auth_bp.get('/api/users/<int:user_id>')
@auth_required
def get_user(user_id):
    user = db.session.get(Utilisateur, user_id)
    if not user:
        return jsonify({'message': 'Utilisateur introuvable'}), 404
    data = user.to_dict()
    if user.role == 'responsable':
        team = Utilisateur.query.filter_by(responsable_id=user.id).order_by(
            Utilisateur.nom, Utilisateur.prenom
        ).all()
        data['responsable'] = None
        data['equipe'] = [m.to_dict() for m in team]
    else:
        if user.responsable_id:
            resp = db.session.get(Utilisateur, user.responsable_id)
            data['responsable'] = resp.to_dict() if resp else None
            colleagues = Utilisateur.query.filter(
                Utilisateur.responsable_id == user.responsable_id,
                Utilisateur.id != user.id
            ).order_by(Utilisateur.nom, Utilisateur.prenom).all()
            data['equipe'] = [c.to_dict() for c in colleagues]
        else:
            data['responsable'] = None
            data['equipe'] = []
    return jsonify(data)


@auth_bp.post('/api/equipe/<int:dev_id>')
@auth_required
def add_to_team(dev_id):
    if g.current_user.role != 'responsable':
        return jsonify({'message': 'Réservé aux responsables'}), 403
    dev = db.session.get(Utilisateur, dev_id)
    if not dev:
        return jsonify({'message': 'Utilisateur introuvable'}), 404
    if dev.role != 'developpeur':
        return jsonify({'message': 'Cible non développeur'}), 400
    dev.responsable_id = g.current_user.id
    db.session.commit()
    return jsonify(dev.to_dict())


@auth_bp.delete('/api/equipe/<int:dev_id>')
@auth_required
def remove_from_team(dev_id):
    if g.current_user.role != 'responsable':
        return jsonify({'message': 'Réservé aux responsables'}), 403
    dev = db.session.get(Utilisateur, dev_id)
    if not dev:
        return jsonify({'message': 'Utilisateur introuvable'}), 404
    if dev.responsable_id != g.current_user.id:
        return jsonify({'message': "Ce développeur n'est pas dans votre équipe"}), 403
    dev.responsable_id = None
    db.session.commit()
    return jsonify(dev.to_dict())
