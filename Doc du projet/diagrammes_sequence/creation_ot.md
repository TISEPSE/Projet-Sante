sequenceDiagram
    actor Utilisateur
    participant Interface as Interface web
    participant Serveur as Serveur API
    participant BDD as Base de donnees

    Utilisateur->>Interface: Remplir le formulaire OT
    Utilisateur->>Interface: Valider la creation
    Interface->>Serveur: Envoyer les donnees de l'OT
    Serveur->>BDD: Enregistrer l'ordre de transport
    BDD-->>Serveur: Confirmer l'enregistrement
    Serveur-->>Interface: Retourner l'OT cree
    Interface-->>Utilisateur: Afficher la confirmation