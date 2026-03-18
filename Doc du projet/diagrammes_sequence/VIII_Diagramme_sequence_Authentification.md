
sequenceDiagram
    actor Utilisateur
    participant Interface as Interface web
    participant Serveur as Serveur API
    participant BDD as Base de donnees

    Utilisateur->>Interface: Saisir email et mot de passe
    Utilisateur->>Interface: Valider la connexion
    Interface->>Serveur: Envoyer la demande de connexion
    Serveur->>BDD: Rechercher l'utilisateur
    BDD-->>Serveur: Retourner les donnees utilisateur

    alt Authentification valide
        Serveur-->>Interface: Retourner le token
        Interface-->>Utilisateur: Ouvrir l'application
    else Authentification invalide
        Serveur-->>Interface: Retourner une erreur
        Interface-->>Utilisateur: Afficher un message d'erreur
    end
