from flask import Blueprint, jsonify, session

from app.extensions import db
from app.models import Notification, User


notifications_bp = Blueprint("notifications", __name__)


def get_authenticated_user():
    """Return the authenticated user, if the session is valid."""
    user_id = session.get("user_id")

    if user_id is None:
        return None

    return db.session.get(User, user_id)


def notification_to_dict(notification):
    """Convert a notification into a frontend-friendly dictionary."""
    actor_name = (
        notification.actor.username
        if notification.actor is not None
        else "Someone"
    )

    if notification.notification_type == "like":
        message = f"{actor_name} liked your post."
    elif notification.notification_type == "comment":
        message = f"{actor_name} commented on your post."
    else:
        message = f"{actor_name} interacted with your post."

    return {
        "id": notification.id,
        "type": notification.notification_type,
        "message": message,
        "actor": {
            "id": notification.actor.id,
            "username": actor_name,
        }
        if notification.actor is not None
        else None,
        "post_id": notification.post_id,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat(),
    }


@notifications_bp.get("/notifications")
def get_notifications():
    """Return the current user's notifications, newest first."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    notifications = (
        Notification.query.filter_by(recipient_id=user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return jsonify(
        [notification_to_dict(notification) for notification in notifications]
    ), 200


@notifications_bp.get("/notifications/unread-count")
def get_unread_count():
    """Return the number of unread notifications for the current user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    unread_count = Notification.query.filter_by(
        recipient_id=user.id,
        is_read=False,
    ).count()

    return jsonify({"unread_count": unread_count}), 200


@notifications_bp.patch("/notifications/<int:notification_id>/read")
def mark_notification_read(notification_id):
    """Mark one notification as read when it belongs to the current user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    notification = db.session.get(Notification, notification_id)

    if notification is None:
        return jsonify({"error": "Notification not found."}), 404

    if notification.recipient_id != user.id:
        return jsonify({"error": "You cannot update this notification."}), 403

    notification.is_read = True
    db.session.commit()

    return jsonify(notification_to_dict(notification)), 200


@notifications_bp.post("/notifications/read-all")
def mark_all_notifications_read():
    """Mark all notifications belonging to the current user as read."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    Notification.query.filter_by(
        recipient_id=user.id,
        is_read=False,
    ).update(
        {"is_read": True},
        synchronize_session=False,
    )
    db.session.commit()

    return jsonify({"message": "All notifications marked as read."}), 200
