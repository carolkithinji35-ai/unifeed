from app.extensions import db
from app.models import Notification


def add_like_notification(actor, post):
    """Create one unread notification when another user likes a post."""
    if actor.id == post.author_id:
        return

    existing_notification = Notification.query.filter_by(
        recipient_id=post.author_id,
        actor_id=actor.id,
        post_id=post.id,
        notification_type="like",
        is_read=False,
    ).first()

    if existing_notification is None:
        db.session.add(
            Notification(
                recipient_id=post.author_id,
                actor_id=actor.id,
                post_id=post.id,
                notification_type="like",
            )
        )


def add_comment_notification(actor, post):
    """Create a notification when another user comments on a post."""
    if actor.id == post.author_id:
        return

    db.session.add(
        Notification(
            recipient_id=post.author_id,
            actor_id=actor.id,
            post_id=post.id,
            notification_type="comment",
        )
    )


def add_follow_notification(actor, followed_user):
    """Create one unread notification when a user follows another user."""
    if actor.id == followed_user.id:
        return

    existing_notification = Notification.query.filter_by(
        recipient_id=followed_user.id,
        actor_id=actor.id,
        notification_type="follow",
        is_read=False,
    ).first()

    if existing_notification is None:
        db.session.add(
            Notification(
                recipient_id=followed_user.id,
                actor_id=actor.id,
                post_id=None,
                notification_type="follow",
            )
        )
