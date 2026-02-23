from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import Utilisateur

auth_bp = Blueprint('auth', __name__)


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


@auth_bp.get('/api/auth/me')
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = Utilisateur.query.get(int(user_id))
    if not user:
        return jsonify({'message': 'Utilisateur introuvable'}), 404
    return jsonify(user.to_dict())
