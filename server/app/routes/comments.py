from flask import Blueprint, jsonify, request, session

from app.extensions import db
from app.models import Comment, Post, User
from app.schemas.comment_schema import (
    comment_to_dict,
    validate_comment_data,
)


comments_bp = Blueprint("comments", __name__)


def get_authenticated_user():
    user_id = session.get("user_id")

    if user_id is None:
        return None

    return db.session.get(User, user_id)


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
    """Create a comment for the currently authenticated user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    data = request.get_json(silent=True)
    validation_error = validate_comment_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    comment = Comment(
        content=data["content"].strip(),
        author_id=user.id,
        post_id=post_id,
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify(comment_to_dict(comment)), 201
