import click
from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate
from app.models import (
    Comment,
    Conversation,
    Follow,
    Group,
    GroupMember,
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

    from app.routes.admin import admin_bp
    from app.routes.auth import auth_bp
    from app.routes.comments import comments_bp
    from app.routes.follows import follows_bp
    from app.routes.groups import groups_bp
    from app.routes.health import health_bp
    from app.routes.messages import messages_bp
    from app.routes.notifications import notifications_bp
    from app.routes.posts import posts_bp

    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(posts_bp, url_prefix="/api")
    app.register_blueprint(comments_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api")
    app.register_blueprint(messages_bp, url_prefix="/api")
    app.register_blueprint(follows_bp, url_prefix="/api")
    app.register_blueprint(groups_bp, url_prefix="/api")

    @app.cli.command("create-university-admin")
    @click.option("--email", prompt=True)
    @click.option("--username", prompt=True)
    @click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True)
    def create_university_admin(email, username, password):
        """Create or promote one controlled university administrator account."""
        normalized_email = email.strip().lower()
        user = User.query.filter_by(email=normalized_email).first()
        if user is None:
            user = User(email=normalized_email, username=username.strip())
            db.session.add(user)
        user.username = username.strip()
        user.role = "university_admin"
        user.set_password(password)
        db.session.commit()
        click.echo(f"University administrator ready: {user.email}")

    return app
