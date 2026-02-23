from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp
from routes.ots import ots_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    app.register_blueprint(auth_bp)
    app.register_blueprint(ots_bp)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
