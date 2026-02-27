from flask import Blueprint, request, jsonify, g
from models import db, OrdreTransport
from routes.auth import auth_required
from datetime import datetime

ots_bp = Blueprint('ots', __name__)


@ots_bp.get('/api/ots')
@auth_required
def list_ots():
    ots = OrdreTransport.query.order_by(
        OrdreTransport.lot_transport, OrdreTransport.ordre_passage
    ).all()
    return jsonify([ot.to_dict() for ot in ots])


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
    return jsonify(ot.to_dict()), 201


@ots_bp.get('/api/ots/<int:ot_id>')
@auth_required
def get_ot(ot_id):
    ot = OrdreTransport.query.get_or_404(ot_id)
    return jsonify(ot.to_dict())


@ots_bp.put('/api/ots/<int:ot_id>')
@auth_required
def update_ot(ot_id):
    ot = OrdreTransport.query.get_or_404(ot_id)
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Aucune donnée fournie'}), 400

    fields = [
        'numero_ot', 'intitule', 'titulaire', 'numero_demande',
        'lot_transport', 'ordre_passage', 'date_souhaitee', 'demandeur', 'remarque',
    ]
    for field in fields:
        if field in data:
            setattr(ot, field, data[field])

    db.session.commit()
    return jsonify(ot.to_dict())


@ots_bp.delete('/api/ots/<int:ot_id>')
@auth_required
def delete_ot(ot_id):
    ot = OrdreTransport.query.get_or_404(ot_id)
    db.session.delete(ot)
    db.session.commit()
    return '', 204


@ots_bp.post('/api/ots/<int:ot_id>/mep')
@auth_required
def validate_mep(ot_id):
    ot = OrdreTransport.query.get_or_404(ot_id)
    user = g.current_user
    ot.mep_effectuee = True
    ot.mep_effectuee_par = f"{user.prenom} {user.nom}"
    ot.mep_date = datetime.utcnow().strftime('%Y-%m-%dT%H:%M')
    db.session.commit()
    return jsonify(ot.to_dict())


@ots_bp.delete('/api/ots/<int:ot_id>/mep')
@auth_required
def cancel_mep(ot_id):
    ot = OrdreTransport.query.get_or_404(ot_id)
    ot.mep_effectuee = False
    ot.mep_effectuee_par = None
    ot.mep_date = None
    db.session.commit()
    return jsonify(ot.to_dict())
