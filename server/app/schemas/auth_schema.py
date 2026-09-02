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

    for field, label in (
        ("first_name", "First name"),
        ("last_name", "Last name"),
    ):
        value = data.get(field)

        if value is not None and not isinstance(value, str):
            return {"error": f"{label} must be a string."}

        if isinstance(value, str) and len(value.strip()) > 80:
            return {"error": f"{label} must be 80 characters or fewer."}

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


def validate_profile_update_data(data):
    """Validate fields supplied when updating a profile."""
    if not isinstance(data, dict):
        return {"error": "Request body must be a JSON object."}

    if not data:
        return {"error": "At least one profile field is required."}

    allowed_fields = {
        "first_name",
        "last_name",
        "username",
        "email",
        "bio",
        "location",
    }
    unknown_fields = set(data) - allowed_fields

    if unknown_fields:
        return {
            "error": (
                "Only first_name, last_name, username, email, bio, "
                "and location can be updated."
            )
        }

    string_limits = {
        "first_name": 80,
        "last_name": 80,
        "username": 80,
        "email": 120,
        "bio": 500,
        "location": 120,
    }

    for field, max_length in string_limits.items():
        if field not in data:
            continue

        value = data[field]

        if not isinstance(value, str):
            return {"error": f"{field} must be a string."}

        if field in {"first_name", "last_name", "bio", "location"}:
            if len(value.strip()) > max_length:
                return {
                    "error": f"{field} must be {max_length} characters or fewer."
                }

        if field == "username":
            username = value.strip()

            if len(username) < 3:
                return {
                    "error": "Username must contain at least 3 characters."
                }

            if len(username) > max_length:
                return {
                    "error": "Username must be 80 characters or fewer."
                }

        if field == "email" and not EMAIL_PATTERN.match(value.strip()):
            return {"error": "A valid email is required."}

    return None


def user_to_dict(user):
    """Convert a User model instance into a safe JSON response."""
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "email": user.email,
        "bio": user.bio,
        "location": user.location,
        "created_at": user.created_at.isoformat(),
    }
