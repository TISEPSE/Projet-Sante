from flask import Blueprint, request, jsonify, g
from models import db, OrdreTransport, LotTransport
from routes.auth import auth_required
from datetime import datetime

ots_bp = Blueprint('ots', __name__)


def _get_or_create_lot(numero):
    """Retourne le LotTransport pour le numéro donné, ou le crée si inexistant."""
    if numero is None:
        return None
    lot = LotTransport.query.filter_by(numero=int(numero)).first()
    if not lot:
        lot = LotTransport(numero=int(numero))
        db.session.add(lot)
        db.session.flush()
    return lot


@ots_bp.get('/api/ots')
@auth_required
def list_ots():
    ots = (
        OrdreTransport.query
        .outerjoin(LotTransport, OrdreTransport.lot_transport_id == LotTransport.id)
        .order_by(LotTransport.numero, OrdreTransport.ordre_passage)
        .all()
    )
    return jsonify([ot.to_dict() for ot in ots])


@ots_bp.post('/api/ots')
@auth_required
def create_ot():
    data = request.get_json()
    if not data or not data.get('numero_ot') or not data.get('intitule'):
        return jsonify({'message': 'Champs obligatoires manquants'}), 400
    if not data.get('titulaire_id'):
        return jsonify({'message': 'titulaire_id est obligatoire'}), 400

    if OrdreTransport.query.filter_by(numero_ot=data['numero_ot']).first():
        return jsonify({'message': 'Ce numéro OT existe déjà'}), 409

    lot = _get_or_create_lot(data.get('lot_transport'))
    ot = OrdreTransport(
        numero_ot=data['numero_ot'],
        intitule=data['intitule'],
        titulaire_id=int(data['titulaire_id']),
        numero_demande=data.get('numero_demande'),
        lot_transport_id=lot.id if lot else None,
        ordre_passage=data.get('ordre_passage'),
        date_souhaitee=data.get('date_souhaitee'),
        demandeur_id=int(data['demandeur_id']) if data.get('demandeur_id') else None,
        remarque=data.get('remarque', ''),
        mep_effectuee=False,
    )
    db.session.add(ot)
    db.session.commit()
    return jsonify(ot.to_dict()), 201


@ots_bp.get('/api/ots/<int:ot_id>')
@auth_required
def get_ot(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    return jsonify(ot.to_dict())


@ots_bp.put('/api/ots/<int:ot_id>')
@auth_required
def update_ot(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Aucune donnée fournie'}), 400

    for field in ['numero_ot', 'intitule', 'numero_demande', 'ordre_passage', 'date_souhaitee', 'remarque']:
        if field in data:
            setattr(ot, field, data[field])

    if 'titulaire_id' in data:
        ot.titulaire_id = int(data['titulaire_id'])
    if 'demandeur_id' in data:
        ot.demandeur_id = int(data['demandeur_id'])
    if 'lot_transport' in data:
        lot = _get_or_create_lot(data['lot_transport'])
        ot.lot_transport_id = lot.id if lot else None

    db.session.commit()
    return jsonify(ot.to_dict())


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
    ot.mep_effectuee = True
    ot.mep_effectuee_par_id = g.current_user.id
    ot.mep_date = datetime.utcnow().strftime('%Y-%m-%dT%H:%M')
    db.session.commit()
    return jsonify(ot.to_dict())


@ots_bp.delete('/api/ots/<int:ot_id>/mep')
@auth_required
def cancel_mep(ot_id):
    ot = db.session.get(OrdreTransport, ot_id)
    if not ot:
        return jsonify({'message': 'OT introuvable'}), 404
    ot.mep_effectuee = False
    ot.mep_effectuee_par_id = None
    ot.mep_date = None
    db.session.commit()
    return jsonify(ot.to_dict())


@ots_bp.get('/api/lots')
@auth_required
def list_lots():
    lots = LotTransport.query.order_by(LotTransport.numero).all()
    return jsonify([lot.to_dict() for lot in lots])
