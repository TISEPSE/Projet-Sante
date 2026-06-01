"""
Script d'initialisation de la base de données.
Recrée les tables et insère des données fictives.

Usage:
    python init_db.py
"""
from app import create_app
from models import db, Utilisateur, LotTransport, OrdreTransport


USERS = [
    {'prenom': 'Admin',      'nom': 'Système',    'email': 'admin@santecie.com',             'password': 'admin', 'role': 'admin'},
    {'prenom': 'Baptiste',   'nom': 'Deme',       'email': 'baptiste.deme@santecie.com',     'password': 'demo',  'role': 'responsable'},
    {'prenom': 'Sophie',     'nom': 'Martin',     'email': 'sophie.martin@santecie.com',     'password': 'demo',  'role': 'responsable'},
    {'prenom': 'Nicolas',    'nom': 'Péret',      'email': 'nicolas.peret@santecie.com',     'password': 'demo',  'role': 'developpeur'},
    {'prenom': 'Loic',       'nom': 'Chevalier',  'email': 'loic.chevalier@santecie.com',    'password': 'demo',  'role': 'developpeur'},
    {'prenom': 'François',   'nom': 'Logeais',    'email': 'francois.logeais@santecie.com',  'password': 'demo',  'role': 'developpeur'},
    {'prenom': 'Patrick',    'nom': 'Thiery',     'email': 'patrick.thiery@santecie.com',    'password': 'demo',  'role': 'developpeur'},
    {'prenom': 'Christophe', 'nom': 'Tétard',     'email': 'christophe.tetard@santecie.com', 'password': 'demo', 'role': 'developpeur'},
    {'prenom': 'Terence',    'nom': 'Belliguic',  'email': 'terence.belliguic@santecie.com', 'password': 'demo',  'role': 'developpeur'},
    {'prenom': 'Andy',       'nom': 'Gravier',    'email': 'andy.gravier@santecie.com',      'password': 'demo',  'role': 'developpeur'},
]

LOTS = [
    {'numero': 1, 'nom': 'Lot Mars S1'},
    {'numero': 2, 'nom': 'Lot Mars S2'},
    {'numero': 3, 'nom': 'Lot Mars S3'},
    {'numero': 4, 'nom': 'Lot Avril S1'},
    {'numero': 5, 'nom': 'Lot Avril S2'},
]

OTS = [
    {
        'numero_ot': 'OT-002401',
        'intitule': 'Migration module dossier patient vers SAP S/4HANA',
        'titulaire_email': 'nicolas.peret@santecie.com',
        'numero_demande': 'DMD-512',
        'lot_numero': 1, 'ordre_passage': 1,
        'date_souhaitee': '2026-03-12T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': 'Dépendance avec OT-002398. Prévoir rollback via SE01.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002402',
        'intitule': 'Correctif anomalie calcul TVA — facturation actes médicaux',
        'titulaire_email': 'loic.chevalier@santecie.com',
        'numero_demande': 'DMD-509',
        'lot_numero': 1, 'ordre_passage': 2,
        'date_souhaitee': '2026-03-12T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': '',
        'mep_effectuee': True,
        'mep_par_email': 'baptiste.deme@santecie.com',
        'mep_date': '2026-03-12T19:04',
    },
    {
        'numero_ot': 'OT-002403',
        'intitule': 'Ajout champ RPPS dans fiche praticien',
        'titulaire_email': 'francois.logeais@santecie.com',
        'numero_demande': 'DMD-506',
        'lot_numero': 2, 'ordre_passage': 1,
        'date_souhaitee': '2026-03-19T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': 'Validation DPO requise avant déploiement.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002404',
        'intitule': 'Refonte interface accueil patients — conformité RGAA',
        'titulaire_email': 'patrick.thiery@santecie.com',
        'numero_demande': 'DMD-503',
        'lot_numero': 2, 'ordre_passage': 2,
        'date_souhaitee': '2026-03-19T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': 'Tests accessibilité à réaliser avec VoiceOver et NVDA.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002405',
        'intitule': 'Optimisation requêtes — lenteur tableau de bord RH',
        'titulaire_email': 'christophe.tetard@santecie.com',
        'numero_demande': 'DMD-499',
        'lot_numero': 3, 'ordre_passage': 1,
        'date_souhaitee': '2026-03-26T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': 'Index à créer sur table EMPLOYE (cf. DMD-499 annexe B).',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002406',
        'intitule': 'Mise à jour certificats SSL — serveurs applicatifs',
        'titulaire_email': 'terence.belliguic@santecie.com',
        'numero_demande': 'DMD-496',
        'lot_numero': 3, 'ordre_passage': 2,
        'date_souhaitee': '2026-03-26T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': 'Arrêt de service prévu 10 min. Notifier les équipes à J-1.',
        'mep_effectuee': True,
        'mep_par_email': 'baptiste.deme@santecie.com',
        'mep_date': '2026-03-26T18:22',
    },
    {
        'numero_ot': 'OT-002407',
        'intitule': 'Intégration API Ameli — remboursements automatiques',
        'titulaire_email': 'andy.gravier@santecie.com',
        'numero_demande': 'DMD-491',
        'lot_numero': 4, 'ordre_passage': 1,
        'date_souhaitee': '2026-04-09T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': 'Attente clé API production CNAM. Déploiement conditionnel.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002408',
        'intitule': 'Paramétrage workflow validation ordonnances électroniques',
        'titulaire_email': 'nicolas.peret@santecie.com',
        'numero_demande': 'DMD-488',
        'lot_numero': 4, 'ordre_passage': 2,
        'date_souhaitee': '2026-04-09T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': '',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002409',
        'intitule': 'Correction calcul gardes et astreintes module planning',
        'titulaire_email': 'loic.chevalier@santecie.com',
        'numero_demande': 'DMD-484',
        'lot_numero': 5, 'ordre_passage': 1,
        'date_souhaitee': '2026-04-16T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
        'remarque': 'Impacte le calcul des paies. Priorité haute.',
        'mep_effectuee': False,
    },
    {
        'numero_ot': 'OT-002410',
        'intitule': 'Déploiement module téléconsultation v2.1',
        'titulaire_email': 'francois.logeais@santecie.com',
        'numero_demande': 'DMD-480',
        'lot_numero': 5, 'ordre_passage': 2,
        'date_souhaitee': '2026-04-16T18:00',
        'demandeur_email': 'baptiste.deme@santecie.com',
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

        # Utilisateurs
        for data in USERS:
            u = Utilisateur(prenom=data['prenom'], nom=data['nom'], email=data['email'], role=data['role'])
            u.set_password(data['password'])
            db.session.add(u)
        db.session.flush()

        users_by_email = {u.email: u for u in Utilisateur.query.all()}
        baptiste = users_by_email['baptiste.deme@santecie.com']
        sophie = users_by_email['sophie.martin@santecie.com']
        equipe_baptiste = {
            'nicolas.peret@santecie.com',
            'loic.chevalier@santecie.com',
            'francois.logeais@santecie.com',
            'terence.belliguic@santecie.com',
            'andy.gravier@santecie.com',
        }
        equipe_sophie = {
            'christophe.tetard@santecie.com',
        }
        # patrick.thiery reste sans responsable (pour démonstration de l'admin)
        for u in Utilisateur.query.filter_by(role='developpeur').all():
            if u.email in equipe_baptiste:
                u.responsable_id = baptiste.id
            elif u.email in equipe_sophie:
                u.responsable_id = sophie.id
        db.session.flush()

        # Lots de transport
        lots_by_numero = {}
        for data in LOTS:
            lot = LotTransport(numero=data['numero'], nom=data['nom'])
            db.session.add(lot)
            lots_by_numero[data['numero']] = lot
        db.session.flush()

        # Ordres de transport
        for data in OTS:
            mep_par_id = users_by_email[data['mep_par_email']].id if data.get('mep_par_email') else None
            ot = OrdreTransport(
                numero_ot=data['numero_ot'],
                intitule=data['intitule'],
                titulaire_id=users_by_email[data['titulaire_email']].id,
                numero_demande=data['numero_demande'],
                lot_transport_id=lots_by_numero[data['lot_numero']].id,
                ordre_passage=data['ordre_passage'],
                date_souhaitee=data['date_souhaitee'],
                demandeur_id=users_by_email[data['demandeur_email']].id,
                remarque=data.get('remarque', ''),
                mep_effectuee=data.get('mep_effectuee', False),
                mep_effectuee_par_id=mep_par_id,
                mep_date=data.get('mep_date'),
            )
            db.session.add(ot)

        db.session.commit()
        print(f'{len(USERS)} utilisateurs insérés.')
        print('  → Baptiste Deme : 5 devs | Sophie Martin : 1 dev | Patrick Thiery : sans responsable')
        print(f'{len(LOTS)} lots de transport insérés.')
        print(f'{len(OTS)} OTs insérés.')
        print('Admin       : admin@santecie.com / admin')
        print('Responsable : baptiste.deme@santecie.com / demo')
        print('Développeur : nicolas.peret@santecie.com / demo')


if __name__ == '__main__':
    init()
