Voici une checklist au format Markdown pour vérifier que votre **Projet-Santé** est parfaitement fonctionnel et prêt pour votre présentation devant le jury du BTS SIO.

# Checklist de vérification : Projet Santé (Gestion des OT)

## 1. Environnement Technique et Déploiement
*   [x] **Conteneurisation :** Le fichier `docker-compose.yml` à la racine lance les trois conteneurs : Backend (Flask), Frontend (React) et Base de données (PostgreSQL). Commande : `docker compose up --build`.
*   [x] **Accessibilité :**
    *   L'interface web répond sur le port **5175**.
    *   L'API REST répond sur le port **5000**.
*   [x] **Dépôt distant :** Code à jour sur le dépôt **GitHub** public avec un historique de commits cohérent.
*   [ ] **Documentation :** Vérifier que le site de documentation en ligne est accessible et complet (contexte, installation, utilisation).

## 2. Fonctionnalités de l'Application (Tests de bout en bout)
*   [x] **Authentification :** Le processus de connexion (login) et de déconnexion fonctionne. Le **token JWT** est bien stocké dans le `localStorage` du navigateur.
*   [x] **Gestion des Ordres de Transport (OT) :**
    *   [x] Créer un nouvel OT (intitulé, titulaire, lot, ordre de passage).
    *   [x] Modifier et supprimer un OT existant.
    *   [x] Consulter la liste globale et le détail d'un OT spécifique.
*   [x] **Validation de Mise en Production (MEP) :**
    *   [x] Valider une MEP (action réservée au profil **Responsable** — contrôle côté backend).
    *   [x] Vérifier l'horodatage automatique et l'enregistrement de l'identité du valideur.
    *   [x] Tester la révocation (annulation) d'une validation (réservée au **Responsable**).
*   [x] **Recherche et Filtrage :** On peut retrouver un OT par son numéro, son intitulé ou son titulaire (bug null corrigé).

## 3. Base de Données et Intégrité
*   [x] **Base de données PostgreSQL** : configurée via Docker (`docker compose up db`) ou `docker compose up --build`.
*   [x] **Schéma Relationnel :** pgAdmin accessible sur le port **8080** (`docker compose up --build`). Connexion : `admin@santecie.com` / `admin`. Serveur BDD : host `db`, port `5432`, user `postgres`, password `password`, db `sante_cie`.
*   [x] **Données de démonstration :** Le script `init_db.py` peuple automatiquement la base au démarrage du conteneur backend (1 responsable + 7 développeurs + 6 OTs).
*   [x] **Intégrité métier :** Les clés étrangères empêchent de créer un OT sans titulaire. La validation MEP nécessite d'être authentifié (JWT) et responsable (rôle vérifié).
*   [x] **Auto-relation :** La hiérarchie `responsable_id` sur la table utilisateur est implémentée et retournée dans les profils.

## 4. Sécurité et Gestion des Droits
*   [x] **Rôles Utilisateurs :** Accès différenciés responsable / développeur.
    *   Un développeur **ne peut pas** valider ni annuler une MEP (403 retourné par l'API).
    *   Un responsable peut gérer son équipe depuis les Paramètres.
*   [ ] **Rôle Visiteur** : non implémenté (uniquement responsable et développeur).
*   [ ] **Rôle Admin** : non implémenté.
*   [x] **Protection des routes :** Tous les endpoints de l'API Flask sont protégés par le décorateur `@auth_required` (JWT vérifié à chaque requête).

## 5. Livrables pour le Jury (Dossier Technique)
*   [ ] **Fiche descriptive :** Vérifier que l'Annexe 7-1-B est bien remplie (n° candidat, compétences travaillées).
*   [ ] **Diagrammes UML/Merise :** S'assurer que tous les schémas sont présents et lisibles dans votre dossier :
    *   Diagramme de cas d'utilisation.
    *   Architecture 3-tiers.
    *   Modèle Conceptuel (MCD) et Logique (MLD) de données.
    *   Diagrammes de séquence (Authentification, Création OT, MEP).
    *   Diagramme de droits d'utilisation (Hiérarchie des rôles)

---

## Commandes utiles pour la démo

```bash
# Lancer toute la stack (PostgreSQL + Backend + Frontend)
docker compose up --build

# Lancer uniquement la BDD (pour dev local sans Docker)
docker compose up db

# Dev local (après avoir lancé la BDD via Docker)
cd backend && python app.py
cd frontend && npm run dev
```

## Identifiants de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Responsable | baptiste.deme@santecie.com | demo |
| Développeur | nicolas.peret@santecie.com | demo |
