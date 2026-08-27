from flask import Blueprint, jsonify, request, session

from app.extensions import db
from app.models import User
from app.schemas.auth_schema import (
    user_to_dict,
    validate_login_data,
    validate_registration_data,
)


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/auth/register")
def register():
    """Register a new user and start their session."""
    data = request.get_json(silent=True)
    validation_error = validate_registration_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]

    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({"error": "Username is already in use."}), 409

    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"error": "Email is already in use."}), 409

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    session.clear()
    session["user_id"] = user.id

    return jsonify(user_to_dict(user)), 201


@auth_bp.post("/auth/login")
def login():
    """Authenticate a user and start their session."""
    data = request.get_json(silent=True)
    validation_error = validate_login_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    email = data["email"].strip().lower()
    password = data["password"]
    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    session.clear()
    session["user_id"] = user.id

    return jsonify(user_to_dict(user)), 200


@auth_bp.post("/auth/logout")
def logout():
    """End the current user's session."""
    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200


@auth_bp.get("/auth/me")
def current_user():
    """Return the currently authenticated user."""
    user_id = session.get("user_id")

    if user_id is None:
        return jsonify({"error": "Authentication required."}), 401

    user = db.session.get(User, user_id)

    if user is None:
        session.clear()
        return jsonify({"error": "User session is no longer valid."}), 401

    return jsonify(user_to_dict(user)), 200
