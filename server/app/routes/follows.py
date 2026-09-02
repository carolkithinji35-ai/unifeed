from flask import Blueprint, jsonify, session

from app.extensions import db
from app.models import Follow, User


follows_bp = Blueprint("follows", __name__)


def get_authenticated_user():
    """Return the authenticated user, if the session is valid."""
    user_id = session.get("user_id")

    if user_id is None:
        return None

    return db.session.get(User, user_id)


def follow_counts(user_id):
    """Return follower and following counts for a user."""
    followers_count = Follow.query.filter_by(following_id=user_id).count()
    following_count = Follow.query.filter_by(follower_id=user_id).count()

    return {
        "followers_count": followers_count,
        "following_count": following_count,
    }


@follows_bp.get("/users/<int:user_id>/follow-status")
def get_follow_status(user_id):
    """Return the follow status between the current user and another user."""
    current_user = get_authenticated_user()

    if current_user is None:
        return jsonify({"error": "Authentication required."}), 401

    target_user = db.session.get(User, user_id)

    if target_user is None:
        return jsonify({"error": "User not found."}), 404

    is_following = (
        current_user.id != target_user.id
        and Follow.query.filter_by(
            follower_id=current_user.id,
            following_id=target_user.id,
        ).first()
        is not None
    )

    return jsonify(
        {
            "is_following": is_following,
            **follow_counts(target_user.id),
        }
    ), 200


@follows_bp.post("/users/<int:user_id>/follow")
def follow_user(user_id):
    """Follow another user."""
    current_user = get_authenticated_user()

    if current_user is None:
        return jsonify({"error": "Authentication required."}), 401

    target_user = db.session.get(User, user_id)

    if target_user is None:
        return jsonify({"error": "User not found."}), 404

    if current_user.id == target_user.id:
        return jsonify({"error": "You cannot follow yourself."}), 400

    existing_follow = Follow.query.filter_by(
        follower_id=current_user.id,
        following_id=target_user.id,
    ).first()

    if existing_follow is None:
        db.session.add(
            Follow(
                follower_id=current_user.id,
                following_id=target_user.id,
            )
        )
        db.session.commit()

    return jsonify(
        {
            "is_following": True,
            **follow_counts(target_user.id),
        }
    ), 200


@follows_bp.delete("/users/<int:user_id>/follow")
def unfollow_user(user_id):
    """Unfollow another user."""
    current_user = get_authenticated_user()

    if current_user is None:
        return jsonify({"error": "Authentication required."}), 401

    target_user = db.session.get(User, user_id)

    if target_user is None:
        return jsonify({"error": "User not found."}), 404

    if current_user.id == target_user.id:
        return jsonify({"error": "You cannot unfollow yourself."}), 400

    existing_follow = Follow.query.filter_by(
        follower_id=current_user.id,
        following_id=target_user.id,
    ).first()

    if existing_follow is not None:
        db.session.delete(existing_follow)
        db.session.commit()

    return jsonify(
        {
            "is_following": False,
            **follow_counts(target_user.id),
        }
    ), 200
