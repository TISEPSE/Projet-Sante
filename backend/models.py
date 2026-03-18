from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class LotTransport(db.Model):
    __tablename__ = 'lot_transport'

    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.Integer, unique=True, nullable=False)
    nom = db.Column(db.String(255))
    date_transport = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'numero': self.numero,
            'nom': self.nom,
            'date_transport': self.date_transport.isoformat() if self.date_transport else None,
        }


class Utilisateur(db.Model):
    __tablename__ = 'utilisateur'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='developpeur')  # 'responsable' | 'developpeur'
    responsable_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=True)

    responsable = db.relationship(
        'Utilisateur',
        primaryjoin='Utilisateur.responsable_id == Utilisateur.id',
        foreign_keys='[Utilisateur.responsable_id]',
        uselist=False,
        lazy='select',
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prenom': self.prenom,
            'email': self.email,
            'role': self.role,
            'responsable_id': self.responsable_id,
        }


class OrdreTransport(db.Model):
    __tablename__ = 'ordre_transport'

    id = db.Column(db.Integer, primary_key=True)
    numero_ot = db.Column(db.String(50), unique=True, nullable=False)
    intitule = db.Column(db.Text, nullable=False)
    titulaire_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)
    numero_demande = db.Column(db.String(50))
    lot_transport_id = db.Column(db.Integer, db.ForeignKey('lot_transport.id'), nullable=True)
    ordre_passage = db.Column(db.Integer)
    date_souhaitee = db.Column(db.String(50))
    demandeur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=True)
    remarque = db.Column(db.Text, default='')
    mep_effectuee = db.Column(db.Boolean, default=False)
    mep_effectuee_par_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=True)
    mep_date = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    titulaire_user = db.relationship('Utilisateur', foreign_keys=[titulaire_id], lazy='select')
    demandeur_user = db.relationship('Utilisateur', foreign_keys=[demandeur_id], lazy='select')
    mep_par_user = db.relationship('Utilisateur', foreign_keys=[mep_effectuee_par_id], lazy='select')
    lot = db.relationship('LotTransport', foreign_keys=[lot_transport_id], lazy='select')

    def to_dict(self):
        tit = self.titulaire_user
        dem = self.demandeur_user
        mep = self.mep_par_user

        responsable_titulaire = None
        if tit and tit.responsable_id and tit.responsable:
            responsable_titulaire = tit.responsable.to_dict()

        return {
            'id': self.id,
            'numero_ot': self.numero_ot,
            'intitule': self.intitule,
            'titulaire_id': self.titulaire_id,
            'titulaire': f"{tit.prenom} {tit.nom}" if tit else '',
            'numero_demande': self.numero_demande,
            'lot_transport_id': self.lot_transport_id,
            'lot_transport': self.lot.numero if self.lot else None,
            'ordre_passage': self.ordre_passage,
            'date_souhaitee': self.date_souhaitee,
            'demandeur_id': self.demandeur_id,
            'demandeur': f"{dem.prenom} {dem.nom}" if dem else '',
            'remarque': self.remarque or '',
            'mep_effectuee': self.mep_effectuee,
            'mep_effectuee_par': f"{mep.prenom} {mep.nom}" if mep else None,
            'mep_date': self.mep_date,
            'responsable_titulaire': responsable_titulaire,
        }
