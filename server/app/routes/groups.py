import secrets
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request, session
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import (
    Group,
    GroupInvite,
    GroupMember,
    GroupMessage,
    Notification,
    User,
)


groups_bp = Blueprint("groups", __name__)
INVITE_DAYS = 7


def get_authenticated_user():
    user_id = session.get("user_id")
    if user_id is None:
        return None
    return db.session.get(User, user_id)


def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }


def is_member(group_id, user_id):
    return GroupMember.query.filter_by(
        group_id=group_id,
        user_id=user_id,
    ).first() is not None


def require_group(group_id):
    group = db.session.get(Group, group_id)
    if group is None:
        return None, (jsonify({"error": "Group not found."}), 404)
    return group, None


def serialize_group(group, current_user_id, include_members=True):
    member_records = list(group.members)
    members = [record.user for record in member_records]
    current_membership = next(
        (
            record
            for record in member_records
            if record.user_id == current_user_id
        ),
        None,
    )
    unread_query = GroupMessage.query.filter(
        GroupMessage.group_id == group.id,
        GroupMessage.sender_id != current_user_id,
    )
    if current_membership and current_membership.last_read_at:
        unread_query = unread_query.filter(
            GroupMessage.created_at > current_membership.last_read_at
        )

    payload = {
        "id": group.id,
        "title": group.title,
        "description": group.description,
        "creator_id": group.creator_id,
        "creator": serialize_user(group.creator),
        "member_count": len(member_records),
        "is_admin": group.creator_id == current_user_id,
        "is_member": any(member.id == current_user_id for member in members),
        "unread_count": unread_query.count(),
        "created_at": group.created_at.isoformat(),
    }
    if include_members:
        payload["members"] = [serialize_user(member) for member in members]
    return payload


def serialize_invite(invite):
    return {
        "id": invite.id,
        "group_id": invite.group_id,
        "token": invite.token,
        "invite_path": f"/group-invite/{invite.token}",
        "expires_at": invite.expires_at.isoformat(),
        "revoked_at": invite.revoked_at.isoformat()
        if invite.revoked_at
        else None,
        "is_active": invite.is_active,
    }


def serialize_message(message):
    return {
        "id": message.id,
        "group_id": message.group_id,
        "sender_id": message.sender_id,
        "sender": serialize_user(message.sender),
        "content": message.content,
        "created_at": message.created_at.isoformat(),
    }


@groups_bp.get("/groups")
def list_groups():
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    groups = (
        Group.query.join(GroupMember)
        .filter(GroupMember.user_id == user.id)
        .order_by(Group.created_at.desc())
        .all()
    )
    return jsonify(
        [serialize_group(group, user.id, include_members=False)
         for group in groups]
    ), 200


@groups_bp.post("/groups")
def create_group():
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    description = data.get("description")
    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Group title is required."}), 400
    if len(title.strip()) > 120:
        return jsonify({"error": "Group title must be 120 characters or fewer."}), 400
    if not isinstance(description, str) or not description.strip():
        return jsonify({"error": "Group description is required."}), 400
    group = Group(title=title.strip(),
                  description=description.strip(), creator_id=user.id)
    db.session.add(group)
    db.session.flush()
    db.session.add(GroupMember(group_id=group.id, user_id=user.id))
    db.session.commit()
    return jsonify(serialize_group(group, user.id)), 201


@groups_bp.get("/groups/<int:group_id>")
def get_group(group_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    if not is_member(group.id, user.id):
        return jsonify({"error": "You must be invited to view this group."}), 403
    return jsonify(serialize_group(group, user.id)), 200


@groups_bp.post("/groups/<int:group_id>/members")
def add_group_member(group_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    if group.creator_id != user.id:
        return jsonify({"error": "Only the group creator can add members."}), 403
    data = request.get_json(silent=True) or {}
    member_user = db.session.get(User, data.get("user_id"))
    if member_user is None:
        return jsonify({"error": "User not found."}), 404
    if is_member(group.id, member_user.id):
        return jsonify({"error": "That user is already a group member."}), 409
    db.session.add(GroupMember(group_id=group.id, user_id=member_user.id))
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "That user is already a group member."}), 409
    return jsonify(serialize_group(group, user.id)), 201


@groups_bp.delete("/groups/<int:group_id>/members/<int:member_user_id>")
def remove_group_member(group_id, member_user_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    if group.creator_id != user.id:
        return jsonify({"error": "Only the group creator can remove members."}), 403
    if member_user_id == group.creator_id:
        return jsonify({"error": "The group creator cannot be removed."}), 400
    membership = GroupMember.query.filter_by(
        group_id=group.id,
        user_id=member_user_id,
    ).first()
    if membership is None:
        return jsonify({"error": "That user is not a member of this group."}), 404
    db.session.delete(membership)
    db.session.commit()
    return jsonify(serialize_group(group, user.id)), 200


@groups_bp.post("/groups/<int:group_id>/invites")
def create_group_invite(group_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    if group.creator_id != user.id:
        return jsonify({"error": "Only the group creator can create invite links."}), 403
    invite = GroupInvite(
        group_id=group.id,
        created_by_id=user.id,
        token=secrets.token_urlsafe(32),
        expires_at=datetime.now(timezone.utc) + timedelta(days=INVITE_DAYS),
    )
    db.session.add(invite)
    db.session.commit()
    return jsonify(serialize_invite(invite)), 201


@groups_bp.get("/group-invites/<string:token>")
def preview_group_invite(token):
    invite = GroupInvite.query.filter_by(token=token).first()
    if invite is None or not invite.is_active:
        return jsonify({"error": "This invite link is invalid or expired."}), 404
    return jsonify({
        "group": {
            "id": invite.group.id,
            "title": invite.group.title,
            "description": invite.group.description,
        },
        "expires_at": invite.expires_at.isoformat(),
    }), 200


@groups_bp.post("/group-invites/<string:token>/accept")
def accept_group_invite(token):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    invite = GroupInvite.query.filter_by(token=token).first()
    if invite is None or not invite.is_active:
        return jsonify({"error": "This invite link is invalid or expired."}), 404
    if is_member(invite.group_id, user.id):
        return jsonify(serialize_group(invite.group, user.id)), 200
    db.session.add(GroupMember(group_id=invite.group_id, user_id=user.id))
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "You are already a member of this group."}), 409
    return jsonify(serialize_group(invite.group, user.id)), 201


@groups_bp.delete("/groups/<int:group_id>/invites/<int:invite_id>")
def revoke_group_invite(group_id, invite_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    if group.creator_id != user.id:
        return jsonify({"error": "Only the group creator can revoke invite links."}), 403
    invite = GroupInvite.query.filter_by(
        id=invite_id, group_id=group.id).first()
    if invite is None:
        return jsonify({"error": "Invite link not found."}), 404
    invite.revoked_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(serialize_invite(invite)), 200


@groups_bp.get("/groups/<int:group_id>/messages")
def list_group_messages(group_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    if not is_member(group.id, user.id):
        return jsonify({"error": "Only Group members can view Group chat."}), 403
    messages = GroupMessage.query.filter_by(group_id=group.id).order_by(
        GroupMessage.created_at.asc(), GroupMessage.id.asc()
    ).all()
    return jsonify([serialize_message(message) for message in messages]), 200


@groups_bp.patch("/groups/<int:group_id>/messages/read")
def mark_group_messages_read(group_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    membership = GroupMember.query.filter_by(
        group_id=group.id,
        user_id=user.id,
    ).first()
    if membership is None:
        return jsonify({"error": "Only Group members can mark chat as read."}), 403

    membership.last_read_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"unread_count": 0}), 200


@groups_bp.post("/groups/<int:group_id>/messages")
def send_group_message(group_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401
    group, error = require_group(group_id)
    if error:
        return error
    if not is_member(group.id, user.id):
        return jsonify({"error": "Only Group members can send Group messages."}), 403
    data = request.get_json(silent=True) or {}
    content = data.get("content")
    if not isinstance(content, str) or not content.strip():
        return jsonify({"error": "Message content must be a non-empty string."}), 400
    content = content.strip()
    if len(content) > 2000:
        return jsonify({"error": "Messages must be 2000 characters or fewer."}), 400
    message = GroupMessage(
        group_id=group.id, sender_id=user.id, content=content)
    db.session.add(message)
    db.session.flush()

    recipient_ids = {
        member.user_id
        for member in group.members
        if member.user_id != user.id
    }
    for recipient_id in recipient_ids:
        db.session.add(
            Notification(
                recipient_id=recipient_id,
                actor_id=user.id,
                group_id=group.id,
                notification_type="group_message",
            )
        )

    db.session.commit()
    return jsonify(serialize_message(message)), 201
