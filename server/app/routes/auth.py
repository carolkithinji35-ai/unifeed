from flask import Blueprint, jsonify, request, session
from sqlalchemy import or_

from app.extensions import db
from app.models import User
from app.schemas.auth_schema import (
    user_to_dict,
    validate_login_data,
    validate_profile_update_data,
    validate_registration_data,
)


auth_bp = Blueprint("auth", __name__)


def get_authenticated_user():
    """Return the authenticated user, if the session is valid."""
    user_id = session.get("user_id")

    if user_id is None:
        return None

    return db.session.get(User, user_id)


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

    user = User(
        first_name=(data.get("first_name") or "").strip() or None,
        last_name=(data.get("last_name") or "").strip() or None,
        username=username,
        email=email,
    )
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
    user = get_authenticated_user()

    if user is None:
        session.clear()
        return jsonify({"error": "Authentication required."}), 401

    return jsonify(user_to_dict(user)), 200


@auth_bp.patch("/auth/me")
def update_current_user():
    """Update the currently authenticated user's profile."""
    user = get_authenticated_user()

    if user is None:
        session.clear()
        return jsonify({"error": "Authentication required."}), 401

    data = request.get_json(silent=True)
    validation_error = validate_profile_update_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    if "username" in data:
        username = data["username"].strip()

        existing_username = User.query.filter(
            User.username == username,
            User.id != user.id,
        ).first()

        if existing_username:
            return jsonify({"error": "Username is already in use."}), 409

    if "email" in data:
        email = data["email"].strip().lower()

        existing_email = User.query.filter(
            User.email == email,
            User.id != user.id,
        ).first()

        if existing_email:
            return jsonify({"error": "Email is already in use."}), 409

    if "first_name" in data:
        user.first_name = data["first_name"].strip() or None

    if "last_name" in data:
        user.last_name = data["last_name"].strip() or None

    if "username" in data:
        user.username = data["username"].strip()

    if "email" in data:
        user.email = data["email"].strip().lower()

    if "bio" in data:
        user.bio = data["bio"].strip() or None

    if "location" in data:
        user.location = data["location"].strip() or None

    db.session.commit()

    return jsonify(user_to_dict(user)), 200
