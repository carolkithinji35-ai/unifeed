from flask import Blueprint, jsonify, request, session

from app.extensions import db
from app.models import Comment, Post, User
from app.schemas.comment_schema import (
    comment_to_dict,
    validate_comment_data,
)
from app.services.notifications import add_comment_notification


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
    add_comment_notification(user, post)
    db.session.commit()

    return jsonify(comment_to_dict(comment)), 201


@comments_bp.patch("/comments/<int:comment_id>")
def update_comment(comment_id):
    """Update a comment only when the authenticated user owns it."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    comment = db.session.get(Comment, comment_id)

    if comment is None:
        return jsonify({"error": "Comment not found."}), 404

    if comment.author_id != user.id:
        return jsonify({"error": "You can only edit your own comments."}), 403

    data = request.get_json(silent=True)
    validation_error = validate_comment_data(data)

    if validation_error:
        return jsonify(validation_error), 400

    comment.content = data["content"].strip()
    db.session.commit()

    return jsonify(comment_to_dict(comment)), 200


@comments_bp.delete("/comments/<int:comment_id>")
def delete_comment(comment_id):
    """Delete a comment only when the authenticated user owns it."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    comment = db.session.get(Comment, comment_id)

    if comment is None:
        return jsonify({"error": "Comment not found."}), 404

    if comment.author_id != user.id:
        return jsonify({"error": "You can only delete your own comments."}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted successfully."}), 200
