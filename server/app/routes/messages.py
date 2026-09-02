from datetime import datetime, timezone

from flask import Blueprint, jsonify, request, session
from sqlalchemy import or_

from app.extensions import db
from app.models import Conversation, Message, User


messages_bp = Blueprint("messages", __name__)


def get_authenticated_user():
    """Return the authenticated user, if the session is valid."""
    user_id = session.get("user_id")

    if user_id is None:
        return None

    return db.session.get(User, user_id)


def get_conversation_for_user(conversation_id, user_id):
    """Return a conversation only when the user participates in it."""
    conversation = db.session.get(Conversation, conversation_id)

    if conversation is None:
        return None

    if user_id not in {
        conversation.user_one_id,
        conversation.user_two_id,
    }:
        return None

    return conversation


def get_other_user(conversation, user_id):
    """Return the other participant in a conversation."""
    if conversation.user_one_id == user_id:
        return conversation.user_two

    return conversation.user_one


def user_to_dict(user):
    """Serialize the public fields used by the messaging UI."""
    return {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


def message_to_dict(message):
    """Serialize a message for the frontend."""
    return {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "sender_id": message.sender_id,
        "sender": user_to_dict(message.sender),
        "content": message.content,
        "is_read": message.is_read,
        "created_at": message.created_at.isoformat(),
    }


def conversation_to_dict(conversation, user_id):
    """Serialize a conversation with its latest message and unread count."""
    other_user = get_other_user(conversation, user_id)

    latest_message = (
        Message.query.filter_by(conversation_id=conversation.id)
        .order_by(Message.created_at.desc(), Message.id.desc())
        .first()
    )

    unread_count = Message.query.filter(
        Message.conversation_id == conversation.id,
        Message.sender_id != user_id,
        Message.is_read.is_(False),
    ).count()

    return {
        "id": conversation.id,
        "other_user": user_to_dict(other_user),
        "latest_message": (
            message_to_dict(latest_message) if latest_message else None
        ),
        "unread_count": unread_count,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
    }


def find_conversation(user_one_id, user_two_id):
    """Find a conversation using normalized user ID order."""
    first_id, second_id = sorted([user_one_id, user_two_id])

    return Conversation.query.filter_by(
        user_one_id=first_id,
        user_two_id=second_id,
    ).first()


@messages_bp.get("/users")
def get_users():
    """Return users available to start a private conversation with."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    users = (
        User.query.filter(User.id != user.id)
        .order_by(User.username.asc())
        .all()
    )

    return jsonify([user_to_dict(other_user) for other_user in users]), 200


@messages_bp.get("/conversations")
def get_conversations():
    """Return the current user's private conversations."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    conversations = (
        Conversation.query.filter(
            or_(
                Conversation.user_one_id == user.id,
                Conversation.user_two_id == user.id,
            )
        )
        .order_by(
            Conversation.updated_at.desc(),
            Conversation.id.desc(),
        )
        .all()
    )

    return jsonify(
        [
            conversation_to_dict(conversation, user.id)
            for conversation in conversations
        ]
    ), 200


@messages_bp.post("/conversations")
def create_conversation():
    """Create or return a one-to-one conversation with another user."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    other_user_id = data.get("user_id")

    if not isinstance(other_user_id, int):
        return jsonify({"error": "user_id must be an integer."}), 400

    if other_user_id == user.id:
        return jsonify({"error": "You cannot message yourself."}), 400

    other_user = db.session.get(User, other_user_id)

    if other_user is None:
        return jsonify({"error": "User not found."}), 404

    conversation = find_conversation(user.id, other_user.id)

    if conversation is None:
        first_id, second_id = sorted([user.id, other_user.id])
        conversation = Conversation(
            user_one_id=first_id,
            user_two_id=second_id,
        )
        db.session.add(conversation)
        db.session.commit()

    return jsonify(conversation_to_dict(conversation, user.id)), 201


@messages_bp.get("/conversations/<int:conversation_id>/messages")
def get_messages(conversation_id):
    """Return messages only for a conversation participant."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    conversation = get_conversation_for_user(conversation_id, user.id)

    if conversation is None:
        return jsonify({"error": "Conversation not found."}), 404

    messages = (
        Message.query.filter_by(conversation_id=conversation.id)
        .order_by(Message.created_at.asc(), Message.id.asc())
        .all()
    )

    return jsonify([message_to_dict(message) for message in messages]), 200


@messages_bp.post("/conversations/<int:conversation_id>/messages")
def send_message(conversation_id):
    """Send a text message as a conversation participant."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    conversation = get_conversation_for_user(conversation_id, user.id)

    if conversation is None:
        return jsonify({"error": "Conversation not found."}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    content = data.get("content")

    if not isinstance(content, str) or not content.strip():
        return jsonify(
            {"error": "Message content must be a non-empty string."}
        ), 400

    content = content.strip()

    if len(content) > 2000:
        return jsonify(
            {"error": "Messages must be 2000 characters or fewer."}
        ), 400

    message_time = datetime.now(timezone.utc)

    message = Message(
        conversation_id=conversation.id,
        sender_id=user.id,
        content=content,
        created_at=message_time,
    )

    conversation.updated_at = message_time
    db.session.add(message)
    db.session.commit()

    return jsonify(message_to_dict(message)), 201


@messages_bp.post("/conversations/<int:conversation_id>/read")
def mark_conversation_read(conversation_id):
    """Mark incoming messages in a conversation as read."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    conversation = get_conversation_for_user(conversation_id, user.id)

    if conversation is None:
        return jsonify({"error": "Conversation not found."}), 404

    Message.query.filter(
        Message.conversation_id == conversation.id,
        Message.sender_id != user.id,
        Message.is_read.is_(False),
    ).update(
        {"is_read": True},
        synchronize_session=False,
    )
    db.session.commit()

    return jsonify({"message": "Conversation marked as read."}), 200


@messages_bp.get("/messages/unread-count")
def get_unread_message_count():
    """Return the current user's unread private-message count."""
    user = get_authenticated_user()

    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    unread_count = Message.query.filter(
        Message.sender_id != user.id,
        Message.is_read.is_(False),
        Message.conversation.has(
            or_(
                Conversation.user_one_id == user.id,
                Conversation.user_two_id == user.id,
            )
        ),
    ).count()

    return jsonify({"unread_count": unread_count}), 200
