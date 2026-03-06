from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class Utilisateur(db.Model):
    __tablename__ = 'utilisateur'

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='developpeur')  # 'responsable' | 'developpeur'

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
        }


class OrdreTransport(db.Model):
    __tablename__ = 'ordre_transport'

    id = db.Column(db.Integer, primary_key=True)
    numero_ot = db.Column(db.String(50), unique=True, nullable=False)
    intitule = db.Column(db.Text, nullable=False)
    titulaire = db.Column(db.String(100), nullable=False)
    numero_demande = db.Column(db.String(50))
    lot_transport = db.Column(db.Integer)
    ordre_passage = db.Column(db.Integer)
    date_souhaitee = db.Column(db.String(50))
    demandeur = db.Column(db.String(100))
    remarque = db.Column(db.Text, default='')
    mep_effectuee = db.Column(db.Boolean, default=False)
    mep_effectuee_par = db.Column(db.String(100))
    mep_date = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'numero_ot': self.numero_ot,
            'intitule': self.intitule,
            'titulaire': self.titulaire,
            'numero_demande': self.numero_demande,
            'lot_transport': self.lot_transport,
            'ordre_passage': self.ordre_passage,
            'date_souhaitee': self.date_souhaitee,
            'demandeur': self.demandeur,
            'remarque': self.remarque or '',
            'mep_effectuee': self.mep_effectuee,
            'mep_effectuee_par': self.mep_effectuee_par,
            'mep_date': self.mep_date,
        }
