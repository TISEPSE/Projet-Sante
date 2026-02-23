-- Tables principales

CREATE TABLE IF NOT EXISTS utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS emplacement (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS statut (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(100) UNIQUE NOT NULL,
    couleur VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS lot_transport (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL,
    nom VARCHAR(255),
    date_transport TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordre_transport (
    id SERIAL PRIMARY KEY,
    numero_ot VARCHAR(50) UNIQUE NOT NULL,
    intitule TEXT NOT NULL,
    titulaire VARCHAR(100) NOT NULL,
    numero_demande VARCHAR(50),
    lot_transport INTEGER,
    ordre_passage INTEGER,
    date_souhaitee VARCHAR(50),
    demandeur VARCHAR(100),
    remarque TEXT DEFAULT '',
    mep_effectuee BOOLEAN DEFAULT FALSE,
    mep_effectuee_par VARCHAR(100),
    mep_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
