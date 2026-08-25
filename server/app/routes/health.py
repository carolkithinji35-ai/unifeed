from flask import Blueprint, jsonify


health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    # Return a simple response confirming that the API is running.
    return jsonify(
        {
            "status": "ok",
            "service": "unifeed-api",
        }
    ), 200
