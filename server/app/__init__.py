from flask import Flask

from app.config import Config
from app.extensions import db, migrate
from app.models import Comment, Post, User


def create_app():
    """Create and configure the UniFeed Flask application."""
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    from app.routes.health import health_bp

    app.register_blueprint(health_bp, url_prefix="/api")

    return app
