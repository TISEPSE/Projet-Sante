sequenceDiagram
    actor Responsable
    participant Interface as Interface web
    participant Serveur as Serveur API
    participant BDD as Base de donnees

    Responsable->>Interface: Cliquer sur "Valider MEP"
    Interface->>Serveur: Envoyer la demande de validation
    Serveur->>BDD: Mettre a jour le statut de l'OT
    BDD-->>Serveur: Confirmer la mise a jour
    Serveur-->>Interface: Retourner le statut modifie
    Interface-->>Responsable: Afficher la validation
