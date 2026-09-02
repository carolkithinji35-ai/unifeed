from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate
from app.models import (
    Comment,
    Conversation,
    Message,
    Notification,
    Post,
    User,
)


def create_app():
    """Create and configure the UniFeed Flask application."""
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "https://unifeed-seven.vercel.app",
                ]
            }
        },
        supports_credentials=True,
    )

    db.init_app(app)
    migrate.init_app(app, db)

    from app.routes.auth import auth_bp
    from app.routes.comments import comments_bp
    from app.routes.health import health_bp
    from app.routes.messages import messages_bp
    from app.routes.notifications import notifications_bp
    from app.routes.posts import posts_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(posts_bp, url_prefix="/api")
    app.register_blueprint(comments_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api")
    app.register_blueprint(messages_bp, url_prefix="/api")

    return app
