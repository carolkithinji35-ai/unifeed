from flask import Flask


def create_app():
    # Create and configure the UniFeed Flask application.
    app = Flask(__name__)

    from app.routes.health import health_bp

    app.register_blueprint(health_bp, url_prefix="/api")

    return app
