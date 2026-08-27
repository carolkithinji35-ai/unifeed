import re


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validate_registration_data(data):
    """Validate the data required to register a user."""
    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object."}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not isinstance(username, str) or not username.strip():
        return {"error": "Username is required."}

    if len(username.strip()) < 3:
        return {"error": "Username must contain at least 3 characters."}

    if not isinstance(email, str) or not EMAIL_PATTERN.match(email.strip()):
        return {"error": "A valid email is required."}

    if not isinstance(password, str) or len(password) < 8:
        return {"error": "Password must contain at least 8 characters."}

    return None


def validate_login_data(data):
    """Validate the data required to log in."""
    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object."}

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not email.strip():
        return {"error": "Email is required."}

    if not isinstance(password, str) or not password:
        return {"error": "Password is required."}

    return None


def user_to_dict(user):
    """Convert a User model instance into a safe JSON response."""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
    }
