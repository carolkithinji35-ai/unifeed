from flask import Blueprint, jsonify, request, session

from app.extensions import db
from app.models import Bookmark, Like, Post, Repost, User
from app.schemas.post_schema import (
    post_to_dict,
    validate_post_data,
    validate_post_update_data,
)


posts_bp = Blueprint("posts", __name__)


def get_authenticated_user():
    """Return the authenticated user, if a valid session exists."""
    user_id = session.get("user_id")

    if user_id is None:
        return None

    return db.session.get(User, user_id)


def get_authenticated_user_id():
    """Return the authenticated user's ID, or None."""
    user = get_authenticated_user()
    return user.id if user else None


@posts_bp.get("/posts")
def get_posts():
    """Return all posts, newest first."""
    current_user_id = get_authenticated_user_id()
    posts = Post.query.order_by(Post.created_at.desc()).all()

    return jsonify(
        [
            post_to_dict(post, current_user_id=current_user_id)
            for post in posts
        ]
    ), 200


@posts_bp.get("/posts/<int:post_id>")
def get_post(post_id):
    """Return one post by ID."""
    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    return jsonify(
        post_to_dict(
            post,
            current_user_id=get_authenticated_user_id(),
        )
    ), 200


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

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 201


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

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 200


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


@posts_bp.post("/posts/<int:post_id>/like")
def like_post(post_id):
    """Like a post for the authenticated user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    existing_like = Like.query.filter_by(
        user_id=user.id,
        post_id=post.id,
    ).first()

    if existing_like is None:
        db.session.add(Like(user_id=user.id, post_id=post.id))
        db.session.commit()

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 200


@posts_bp.delete("/posts/<int:post_id>/like")
def unlike_post(post_id):
    """Remove the authenticated user's like from a post."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    existing_like = Like.query.filter_by(
        user_id=user.id,
        post_id=post.id,
    ).first()

    if existing_like is not None:
        db.session.delete(existing_like)
        db.session.commit()

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 200


@posts_bp.post("/posts/<int:post_id>/repost")
def repost_post(post_id):
    """Repost a post for the authenticated user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    existing_repost = Repost.query.filter_by(
        user_id=user.id,
        post_id=post.id,
    ).first()

    if existing_repost is None:
        db.session.add(Repost(user_id=user.id, post_id=post.id))
        db.session.commit()

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 200


@posts_bp.delete("/posts/<int:post_id>/repost")
def unrepost_post(post_id):
    """Remove the authenticated user's repost from a post."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    existing_repost = Repost.query.filter_by(
        user_id=user.id,
        post_id=post.id,
    ).first()

    if existing_repost is not None:
        db.session.delete(existing_repost)
        db.session.commit()

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 200


@posts_bp.get("/bookmarks")
def get_bookmarks():
    """Return the authenticated user's bookmarked posts."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    bookmarks = Bookmark.query.filter_by(user_id=user.id).order_by(
        Bookmark.created_at.desc()
    ).all()

    return jsonify(
        [
            post_to_dict(
                bookmark.post,
                current_user_id=user.id,
            )
            for bookmark in bookmarks
        ]
    ), 200


@posts_bp.post("/posts/<int:post_id>/bookmark")
def bookmark_post(post_id):
    """Bookmark a post for the authenticated user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    existing_bookmark = Bookmark.query.filter_by(
        user_id=user.id,
        post_id=post.id,
    ).first()

    if existing_bookmark is None:
        db.session.add(Bookmark(user_id=user.id, post_id=post.id))
        db.session.commit()

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 200


@posts_bp.delete("/posts/<int:post_id>/bookmark")
def unbookmark_post(post_id):
    """Remove the authenticated user's bookmark from a post."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    post = db.session.get(Post, post_id)

    if post is None:
        return jsonify({"error": "Post not found."}), 404

    existing_bookmark = Bookmark.query.filter_by(
        user_id=user.id,
        post_id=post.id,
    ).first()

    if existing_bookmark is not None:
        db.session.delete(existing_bookmark)
        db.session.commit()

    return jsonify(
        post_to_dict(
            post,
            current_user_id=user.id,
        )
    ), 200
