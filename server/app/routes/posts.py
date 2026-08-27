from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import Post, User
from app.schemas.post_schema import post_to_dict, validate_post_data, validate_post_update_data


posts_bp = Blueprint("posts", __name__)


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
    """Create a post using a temporary author ID until authentication exists."""
    data = request.get_json(silent=True)
    validation_error = validate_post_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    author_id = data.get("author_id")

    if not isinstance(author_id, int):
        return jsonify({"error": "author_id is required and must be an integer."}), 400

    author = db.session.get(User, author_id)

    if author is None:
        return jsonify({"error": "Author not found."}), 404

    post = Post(
        content=data["content"].strip(),
        image_url=data.get("image_url"),
        author_id=author_id,
    )

    db.session.add(post)
    db.session.commit()

    return jsonify(post_to_dict(post)), 201


@posts_bp.patch("/posts/<int:post_id>")
def update_post(post_id):
    """Update the content or image URL of an existing post."""
    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

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
    """Delete an existing post and its comments."""
    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted successfully."}), 200
