
flowchart TD
    A([Début]) --> B[Saisir email et mot de passe]
    B --> C[Envoyer POST /api/auth/login]
    C --> D{Identifiants valides ?}
    D -->|Non| E[Afficher erreur]
    E --> B
    D -->|Oui| F[Recevoir JWT token]
    F --> G[Stocker le token dans localStorage]
    G --> H[Rediriger vers la liste des OTs]
    H --> I([Fin])
