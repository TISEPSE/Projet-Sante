# Outil de Suivi des Mises en Production — Santé&Cie

## But de l'application

Santé&Cie gère ses déploiements logiciels via des **Ordres de Transport (OT)** générés dans SAP.
Aujourd'hui ce suivi se fait dans un fichier Excel : l'objectif est de le remplacer par une
application web interne, accessible à toute l'équipe technique.

L'application permet de :
- **Créer et gérer des OT** avec toutes leurs informations
- **Planifier les mises en production** en indiquant la date et l'heure souhaitées
- **Valider qu'une MEP a eu lieu** en enregistrant automatiquement qui l'a effectuée et quand
- **Rechercher et consulter** l'historique de tous les OT

---

## Ce que l'application gère

Chaque OT contient les informations suivantes :

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| Numéro de l'OT | Identifiant unique provenant de SAP | Oui |
| Intitulé (désignation) | Description de ce que contient l'OT | Oui |
| Titulaire | Personne responsable de l'OT | Oui |
| Numéro de demande | Référence du ticket Mantis ou Redmine associé | Oui |
| Lot de transport | Séquence calculée pour chaque demande | Oui |
| Ordre de passage | Ordre dans lequel l'OT doit être traité | Oui |
| Date et heure souhaitées | Date/heure de mise en production prévue (18h00 par défaut) | Oui |
| Demandeur | Personne qui a créé la demande | Oui |
| Remarque | Notes libres complémentaires | Non |

### Validation de la MEP

Chaque OT peut être passé en statut **"MEP effectuée"** :
- Un bouton dédié est disponible sur la fiche de l'OT
- Au clic, l'application enregistre automatiquement **le nom de l'utilisateur connecté** et **la date et l'heure exactes**
- Ces informations sont affichées sur la fiche de l'OT et dans la liste
- L'action est **irréversible** (on ne peut pas dé-valider une MEP)

---

## Stack technique

- **Frontend :** React + Tailwind CSS
- **Backend :** Flask (Python) — API REST
- **Base de données :** PostgreSQL

---

## Navigation

- Toutes les pages sont protégées par authentification (email + mot de passe)
- Sidebar verticale fixe avec : accès à la liste des OT, création d'un OT, nom de l'utilisateur connecté, déconnexion

---

## Pages

### 1. Connexion
Formulaire email + mot de passe. Redirection vers la liste des OT après connexion.

### 2. Liste des OT
Tableau de tous les OT avec les colonnes principales. Barre de recherche (numéro d'OT, numéro de demande, titulaire, demandeur). Les OT avec MEP effectuée sont visuellement distingués. Chaque ligne mène au détail de l'OT.

### 3. Formulaire de création / modification
Formulaire avec tous les champs de l'OT. Utilisé aussi bien pour créer un nouvel OT que pour modifier un OT existant.

### 4. Détail d'un OT
Fiche complète en lecture seule. Contient le bouton **"Valider la MEP"** si elle n'a pas encore eu lieu, ou affiche les informations de validation (par qui, quand) si elle est déjà effectuée. Permet aussi de modifier ou supprimer l'OT.
