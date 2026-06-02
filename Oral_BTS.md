Contexte: je passe actuellement à l'oral d'un BTS SIO et j'ai une situation que je dois appliquer à l'application.

ça se déroule en 2 phases:

1: Théorisation du besoin

2: Application de ce besoin à l'application

---

Partie 1 — Théorisation du besoin:

La demande qui m'est faite est la suivante: Santé&Cie manipule des informations personnelles ou sensibles. Lorsqu'une donnée sensible est modifiée dans l'application (peu importe la table concernée), l'application doit conserver une trace minimale de la modification.

Spécification fonctionnelle:

- Ajouter une traçabilité des modifications sensibles : date, champ modifié, utilisateur concerné et auteur de la modification

Données sensibles identifiées dans l'application:

| Table            | Champ                | Pourquoi sensible                             |
|------------------|----------------------|-----------------------------------------------|
| utilisateur      | nom, prenom          | Identité personnelle (RGPD)                   |
| utilisateur      | email                | Donnée de contact personnelle (RGPD)          |
| utilisateur      | password_hash        | Authentification                              |
| utilisateur      | role                 | Contrôle des accès (risque élévation droits)  |
| utilisateur      | responsable_id       | Structure organisationnelle                   |
| ordre_transport  | titulaire_id         | Responsabilité sur un OT                      |
| ordre_transport  | demandeur_id         | Traçabilité de la demande                     |
| ordre_transport  | mep_effectuee        | Validation critique métier                    |
| ordre_transport  | mep_effectuee_par_id | Responsabilité de la mise en production       |
| ordre_transport  | mep_date             | Date de validation MEP                        |

Éléments attendus dans la trace:

- utilisateur concerné
- auteur de la modification
- champ sensible modifié
- date et heure de modification
- trace limitée au nécessaire (on enregistre le nom du champ, pas sa valeur)

Contraintes:

- Seules les modifications de champs sensibles doivent être journalisées (pas les erreurs)
- La trace doit rester minimale
- Les valeurs sensibles (ancienne et nouvelle) ne doivent pas être stockées
- L'accès aux traces doit être réservé aux profils autorisés
- Les erreurs doivent être gérées sans exposer d'information sensible

---

Partie 2 — Réalisation du besoin:

## 1. Base de données (SQL)

Créer une nouvelle table `journal_modifications` avec les colonnes suivantes:

| Colonne               | Type     | Description                                      |
|-----------------------|----------|--------------------------------------------------|
| id                    | INTEGER  | Clé primaire auto-incrémentée                    |
| utilisateur_concerne_id | INTEGER | FK → utilisateur (qui est concerné)             |
| auteur_id             | INTEGER  | FK → utilisateur (qui a fait la modification)    |
| table_concernee       | VARCHAR  | Nom de la table modifiée (ex: "ordre_transport") |
| champ_modifie         | VARCHAR  | Nom du champ modifié (ex: "role", "mep_effectuee")|
| date_modification     | DATETIME | Date et heure de la modification                 |

Principe de TRANSACTION SQL: la modification de la donnée et l'insertion du log sont effectuées dans la même transaction. Si l'une échoue, les deux sont annulées (rollback).

## 2. Backend (Flask)

Fichiers modifiés:

- `backend/models.py` — ajout du modèle `JournalModification` correspondant à la nouvelle table
- `backend/utils/journal.py` — **nouveau fichier utilitaire** contenant une seule fonction `journaliser()` qui insère une ligne dans `journal_modifications`. Toute la logique de log est centralisée ici, on ne la duplique nulle part.
- `backend/routes/ots.py` — dans la route de modification d'un OT, on appelle simplement `journaliser()` pour chaque champ sensible modifié
- `backend/routes/utilisateurs.py` — même principe pour les modifications de profil
- `backend/routes/journal.py` — nouvelle route `GET /api/journal`, accessible uniquement aux responsables (vérification du rôle via le JWT)

Principe de la fonction `journaliser()`: elle reçoit en paramètre le nom de la table, le champ modifié, l'utilisateur concerné et l'auteur, puis insère la ligne dans le journal. C'est tout.

Gestion des erreurs:

- La modification et le log sont dans la même transaction SQL : si l'un échoue, les deux sont annulés (rollback)
- Les messages d'erreur retournés au client ne contiennent jamais de données sensibles

## 3. Frontend (React)

Fichiers modifiés:

- `frontend/src/pages/Journal.jsx` — nouvelle page qui appelle `GET /api/journal` et affiche le résultat dans un tableau simple
- `frontend/src/components/Sidebar.jsx` — ajout d'un lien vers cette page, visible uniquement pour les responsables
