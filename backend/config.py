import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 'postgresql://postgres:password@localhost:5432/sante_cie'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            'CORS_ORIGINS', 'http://localhost:5173,http://localhost:5175'
        ).split(',')
        if origin.strip()
    ]
