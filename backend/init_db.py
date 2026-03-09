"""
Script d'initialisation de la base de données.
Recrée les tables et insère des données fictives.

Usage:
    python init_db.py
"""
from app import create_app
from models import db, Utilisateur, OrdreTransport


USERS = [
    {'prenom': 'Baptiste',   'nom': 'Deme',      'email': 'baptiste.deme@santecie.com',    'password': 'demo', 'role': 'responsable'},
    {'prenom': 'Nicolas',    'nom': 'Péret',      'email': 'n.peret@sante-cie.fr',       'password': 'demo', 'role': 'developpeur'},
    {'prenom': 'Loic',       'nom': 'Chevalier',  'email': 'l.chevalier@sante-cie.fr',   'password': 'demo', 'role': 'developpeur'},
    {'prenom': 'François',   'nom': 'Logeais',    'email': 'f.logeais@sante-cie.fr',     'password': 'demo', 'role': 'developpeur'},
    {'prenom': 'Patrick',    'nom': 'Thiery',     'email': 'p.thiery@sante-cie.fr',      'password': 'demo', 'role': 'developpeur'},
    {'prenom': 'Christophe', 'nom': 'Tétard',     'email': 'c.tetard@sante-cie.fr',      'password': 'demo', 'role': 'developpeur'},
    {'prenom': 'Terence',    'nom': 'Belliguic',  'email': 't.belliguic@sante-cie.fr',   'password': 'demo', 'role': 'developpeur'},
    {'prenom': 'Andy',       'nom': 'Gravier',    'email': 'a.gravier@sante-cie.fr',     'password': 'demo', 'role': 'developpeur'},
]

OTS = [
    {
        'numero_ot': 'OT-002401',
        'intitule': 'Migration module dossier patient vers SAP S/4HANA',
        'titulaire': 'Nicolas Péret',
        'numero_demande': 'DMD-512',
        'lot_transport': 1, 'ordre_passage': 1,
        'date_souhaitee': '2026-03-12T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Dépendance avec OT-002398. Prévoir rollback via SE01.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002402',
        'intitule': 'Correctif anomalie calcul TVA — facturation actes médicaux',
        'titulaire': 'Loic Chevalier',
        'numero_demande': 'DMD-509',
        'lot_transport': 1, 'ordre_passage': 2,
        'date_souhaitee': '2026-03-12T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': '',
        'mep_effectuee': True,
        'mep_effectuee_par': 'Baptiste Deme',
        'mep_date': '2026-03-12T19:04',
    },
    {
        'numero_ot': 'OT-002403',
        'intitule': 'Ajout champ RPPS dans fiche praticien',
        'titulaire': 'François Logeais',
        'numero_demande': 'DMD-506',
        'lot_transport': 2, 'ordre_passage': 1,
        'date_souhaitee': '2026-03-19T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Validation DPO requise avant déploiement.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002404',
        'intitule': 'Refonte interface accueil patients — conformité RGAA',
        'titulaire': 'Patrick Thiery',
        'numero_demande': 'DMD-503',
        'lot_transport': 2, 'ordre_passage': 2,
        'date_souhaitee': '2026-03-19T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Tests accessibilité à réaliser avec VoiceOver et NVDA.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002405',
        'intitule': 'Optimisation requêtes — lenteur tableau de bord RH',
        'titulaire': 'Christophe Tétard',
        'numero_demande': 'DMD-499',
        'lot_transport': 3, 'ordre_passage': 1,
        'date_souhaitee': '2026-03-26T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Index à créer sur table EMPLOYE (cf. DMD-499 annexe B).',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002406',
        'intitule': 'Mise à jour certificats SSL — serveurs applicatifs',
        'titulaire': 'Terence Belliguic',
        'numero_demande': 'DMD-496',
        'lot_transport': 3, 'ordre_passage': 2,
        'date_souhaitee': '2026-03-26T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Arrêt de service prévu 10 min. Notifier les équipes à J-1.',
        'mep_effectuee': True,
        'mep_effectuee_par': 'Baptiste Deme',
        'mep_date': '2026-03-26T18:22',
    },
    {
        'numero_ot': 'OT-002407',
        'intitule': 'Intégration API Ameli — remboursements automatiques',
        'titulaire': 'Andy Gravier',
        'numero_demande': 'DMD-491',
        'lot_transport': 4, 'ordre_passage': 1,
        'date_souhaitee': '2026-04-09T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Attente clé API production CNAM. Déploiement conditionnel.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002408',
        'intitule': 'Paramétrage workflow validation ordonnances électroniques',
        'titulaire': 'Nicolas Péret',
        'numero_demande': 'DMD-488',
        'lot_transport': 4, 'ordre_passage': 2,
        'date_souhaitee': '2026-04-09T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': '',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002409',
        'intitule': 'Correction calcul gardes et astreintes module planning',
        'titulaire': 'Loic Chevalier',
        'numero_demande': 'DMD-484',
        'lot_transport': 5, 'ordre_passage': 1,
        'date_souhaitee': '2026-04-16T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Impacte le calcul des paies. Priorité haute.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002410',
        'intitule': 'Déploiement module téléconsultation v2.1',
        'titulaire': 'François Logeais',
        'numero_demande': 'DMD-480',
        'lot_transport': 5, 'ordre_passage': 2,
        'date_souhaitee': '2026-04-16T18:00',
        'demandeur': 'Baptiste Deme',
        'remarque': 'Compatibilité testée sur Firefox, Chrome et Safari uniquement.',
        'mep_effectuee': False,
    },
]


def init():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()
        print('Tables recréées.')

        for data in USERS:
            u = Utilisateur(
                prenom=data['prenom'],
                nom=data['nom'],
                email=data['email'],
                role=data['role'],
            )
            u.set_password(data['password'])
            db.session.add(u)
        db.session.flush()

        baptiste = Utilisateur.query.filter_by(email='baptiste.deme@santecie.com').first()
        for u in Utilisateur.query.filter_by(role='developpeur').all():
            u.responsable_id = baptiste.id

        for data in OTS:
            ot = OrdreTransport(
                numero_ot=data['numero_ot'],
                intitule=data['intitule'],
                titulaire=data['titulaire'],
                numero_demande=data['numero_demande'],
                lot_transport=data['lot_transport'],
                ordre_passage=data['ordre_passage'],
                date_souhaitee=data['date_souhaitee'],
                demandeur=data['demandeur'],
                remarque=data.get('remarque', ''),
                mep_effectuee=data.get('mep_effectuee', False),
                mep_effectuee_par=data.get('mep_effectuee_par'),
                mep_date=data.get('mep_date'),
            )
            db.session.add(ot)

        db.session.commit()
        print(f'{len(USERS)} utilisateurs insérés ({len(USERS)-1} devs affiliés à Baptiste Deme).')
        print(f'{len(OTS)} OTs insérés.')
        print('Connexion : baptiste.deme@santecie.com / demo')


if __name__ == '__main__':
    init()
