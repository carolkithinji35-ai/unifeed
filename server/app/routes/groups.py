from flask import Blueprint, jsonify, request, session
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Group, GroupMember, User


groups_bp = Blueprint("groups", __name__)


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


def serialize_group(group, current_user_id, include_members=True):
    member_records = list(group.members)
    members = [record.user for record in member_records]

    payload = {
        "id": group.id,
        "title": group.title,
        "description": group.description,
        "creator_id": group.creator_id,
        "creator": serialize_user(group.creator),
        "member_count": len(member_records),
        "is_admin": group.creator_id == current_user_id,
        "is_member": any(member.id == current_user_id for member in members),
        "created_at": group.created_at.isoformat(),
    }

    if include_members:
        payload["members"] = [serialize_user(member) for member in members]

    return payload


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

    group = Group(
        title=title.strip(),
        description=description.strip(),
        creator_id=user.id,
    )
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

    group = db.session.get(Group, group_id)
    if group is None:
        return jsonify({"error": "Group not found."}), 404

    if not is_member(group.id, user.id):
        return jsonify({"error": "You must be invited to view this group."}), 403

    return jsonify(serialize_group(group, user.id)), 200


@groups_bp.post("/groups/<int:group_id>/members")
def add_group_member(group_id):
    user = get_authenticated_user()
    if user is None:
        return jsonify({"error": "Authentication required."}), 401

    group = db.session.get(Group, group_id)
    if group is None:
        return jsonify({"error": "Group not found."}), 404

    if group.creator_id != user.id:
        return jsonify({"error": "Only the group creator can add members."}), 403

    data = request.get_json(silent=True) or {}
    member_user_id = data.get("user_id")
    member_user = db.session.get(User, member_user_id)

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

    group = db.session.get(Group, group_id)
    if group is None:
        return jsonify({"error": "Group not found."}), 404

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
