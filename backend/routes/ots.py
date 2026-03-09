from flask import Blueprint, request, jsonify, g
from models import db, OrdreTransport, Utilisateur
from routes.auth import auth_required
from datetime import datetime

ots_bp = Blueprint('ots', __name__)


def _find_responsable(titulaire_name, users_by_name, users_by_id):
    """Retourne le to_dict() du responsable du titulaire, ou None."""
    tit = users_by_name.get(titulaire_name)
    if tit and tit.responsable_id:
        resp = users_by_id.get(tit.responsable_id)
        return resp.to_dict() if resp else None
    return None


def _load_user_maps():
    users = Utilisateur.query.all()
    by_name = {f"{u.prenom} {u.nom}": u for u in users}
    by_id = {u.id: u for u in users}
    return by_name, by_id


@ots_bp.get('/api/ots')
@auth_required
def list_ots():
    ots = OrdreTransport.query.order_by(
        OrdreTransport.lot_transport, OrdreTransport.ordre_passage
    ).all()
    by_name, by_id = _load_user_maps()
    result = []
    for ot in ots:
        d = ot.to_dict()
        d['responsable_titulaire'] = _find_responsable(ot.titulaire, by_name, by_id)
        result.append(d)
    return jsonify(result)


@ots_bp.post('/api/ots')
@auth_required
def create_ot():
    data = request.get_json()
    if not data or not data.get('numero_ot') or not data.get('intitule'):
        return jsonify({'message': 'Champs obligatoires manquants'}), 400

    if OrdreTransport.query.filter_by(numero_ot=data['numero_ot']).first():
        return jsonify({'message': 'Ce numéro OT existe déjà'}), 409

    ot = OrdreTransport(
        numero_ot=data['numero_ot'],
        intitule=data['intitule'],
        titulaire=data.get('titulaire', ''),
        numero_demande=data.get('numero_demande'),
        lot_transport=data.get('lot_transport'),
        ordre_passage=data.get('ordre_passage'),
        date_souhaitee=data.get('date_souhaitee'),
        demandeur=data.get('demandeur'),
        remarque=data.get('remarque', ''),
        mep_effectuee=False,
    )
    db.session.add(ot)
    db.session.commit()
    by_name, by_id = _load_user_maps()
    d = ot.to_dict()
    d['responsable_titulaire'] = _find_responsable(ot.titulaire, by_name, by_id)
    return jsonify(d), 201


@ots_bp.get('/api/ots/<int:ot_id>')
@auth_required
def get_ot(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    by_name, by_id = _load_user_maps()
    d = ot.to_dict()
    d['responsable_titulaire'] = _find_responsable(ot.titulaire, by_name, by_id)
    return jsonify(d)


@ots_bp.put('/api/ots/<int:ot_id>')
@auth_required
def update_ot(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Aucune donnée fournie'}), 400

    for field in ['numero_ot', 'intitule', 'titulaire', 'numero_demande',
                  'lot_transport', 'ordre_passage', 'date_souhaitee', 'demandeur', 'remarque']:
        if field in data:
            setattr(ot, field, data[field])

    db.session.commit()
    by_name, by_id = _load_user_maps()
    d = ot.to_dict()
    d['responsable_titulaire'] = _find_responsable(ot.titulaire, by_name, by_id)
    return jsonify(d)


@ots_bp.delete('/api/ots/<int:ot_id>')
@auth_required
def delete_ot(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    db.session.delete(ot)
    db.session.commit()
    return '', 204


@ots_bp.post('/api/ots/<int:ot_id>/mep')
@auth_required
def validate_mep(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    user = g.current_user
    ot.mep_effectuee = True
    ot.mep_effectuee_par = f"{user.prenom} {user.nom}"
    ot.mep_date = datetime.utcnow().strftime('%Y-%m-%dT%H:%M')
    db.session.commit()
    by_name, by_id = _load_user_maps()
    d = ot.to_dict()
    d['responsable_titulaire'] = _find_responsable(ot.titulaire, by_name, by_id)
    return jsonify(d)


@ots_bp.delete('/api/ots/<int:ot_id>/mep')
@auth_required
def cancel_mep(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    ot.mep_effectuee = False
    ot.mep_effectuee_par = None
    ot.mep_date = None
    db.session.commit()
    by_name, by_id = _load_user_maps()
    d = ot.to_dict()
    d['responsable_titulaire'] = _find_responsable(ot.titulaire, by_name, by_id)
    return jsonify(d)
