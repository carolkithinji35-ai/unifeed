from flask import Blueprint, jsonify, request, session

from app.extensions import db
from app.models import Post, User
from app.schemas.post_schema import (
    post_to_dict,
    validate_post_data,
    validate_post_update_data,
)


posts_bp = Blueprint("posts", __name__)


def get_authenticated_user():
    user_id = session.get("user_id")

    if user_id is None:
        return None

    return db.session.get(User, user_id)


@posts_bp.get("/posts")
def get_posts():
    """Return all posts, newest first."""
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([post_to_dict(post) for post in posts]), 200


@posts_bp.get("/posts/<int:post_id>")
def get_post(post_id):
    """Return one post by ID."""
    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    return jsonify(post_to_dict(post)), 200


@posts_bp.post("/posts")
def create_post():
    """Create a post for the currently authenticated user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    data = request.get_json(silent=True)
    validation_error = validate_post_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    post = Post(
        content=data["content"].strip(),
        image_url=data.get("image_url"),
        author_id=user.id,
    )

    db.session.add(post)
    db.session.commit()

    return jsonify(post_to_dict(post)), 201


@posts_bp.patch("/posts/<int:post_id>")
def update_post(post_id):
    """Update a post only when the authenticated user owns it."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    if post.author_id != user.id:
        return jsonify({"error": "You can only edit your own posts."}), 403

    data = request.get_json(silent=True)
    validation_error = validate_post_update_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    if "content" in data:
        post.content = data["content"].strip()

    if "image_url" in data:
        post.image_url = data["image_url"]

    db.session.commit()

    return jsonify(post_to_dict(post)), 200


@posts_bp.delete("/posts/<int:post_id>")
def delete_post(post_id):
    """Delete a post only when the authenticated user owns it."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    if post.author_id != user.id:
        return jsonify({"error": "You can only delete your own posts."}), 403

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted successfully."}), 200
