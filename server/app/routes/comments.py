from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import Comment, Post, User
from app.schemas.comment_schema import (
    comment_to_dict,
    validate_comment_data,
)


comments_bp = Blueprint("comments", __name__)


@comments_bp.get("/posts/<int:post_id>/comments")
def get_comments(post_id):
    """Return all comments belonging to a post."""
    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    comments = (
        Comment.query.filter_by(post_id=post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

    return jsonify([comment_to_dict(comment) for comment in comments]), 200


@comments_bp.post("/posts/<int:post_id>/comments")
def create_comment(post_id):
    """Create a comment using a temporary author ID until authentication exists."""
    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    data = request.get_json(silent=True)
    validation_error = validate_comment_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    author_id = data.get("author_id")

    if not isinstance(author_id, int):
        return jsonify({"error": "author_id is required and must be an integer."}), 400

    author = db.session.get(User, author_id)

    if author is None:
        return jsonify({"error": "Author not found."}), 404

    comment = Comment(
        content=data["content"].strip(),
        author_id=author_id,
        post_id=post_id,
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify(comment_to_dict(comment)), 201
