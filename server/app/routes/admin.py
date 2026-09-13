from datetime import datetime, timezone

from flask import Blueprint, jsonify, request, session
from sqlalchemy import func, or_

from app.extensions import db
from app.models import Comment, Group, GroupMember, Post, User


admin_bp = Blueprint("admin", __name__)


def get_authenticated_user():
    user_id = session.get("user_id")
    if user_id is None:
        return None
    return db.session.get(User, user_id)


def require_university_admin():
    user = get_authenticated_user()
    if user is None:
        return None, (jsonify({"error": "Authentication required."}), 401)
    if user.role != "university_admin":
        return None, (jsonify({"error": "University administrator access required."}), 403)
    return user, None


def serialize_student(user):
    return {
        "id": user.id,
        "student_id": user.student_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat(),
    }


@admin_bp.get("/admin/access")
def dashboard_access():
    user, error_response = require_university_admin()
    if error_response:
        return error_response
    return jsonify({"allowed": True, "role": user.role}), 200


@admin_bp.get("/admin/summary")
def dashboard_summary():
    """Return real, privacy-safe aggregate data for university administrators."""
    _, error_response = require_university_admin()
    if error_response:
        return error_response

    today_start = datetime.now(timezone.utc).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    registered_students = User.query.filter_by(role="student").count()
    students_with_id = User.query.filter(
        User.role == "student",
        User.student_id.isnot(None),
    ).count()
    posts_today = Post.query.filter(Post.created_at >= today_start).count()
    comments_today = Comment.query.filter(
        Comment.created_at >= today_start).count()

    return jsonify(
        {
            "metrics": {
                "registered_students": registered_students,
                "students_with_id": students_with_id,
                "active_today": posts_today + comments_today,
                "pending_reports": 0,
                "total_posts": Post.query.count(),
                "total_comments": Comment.query.count(),
                "total_groups": Group.query.count(),
                "total_group_members": GroupMember.query.count(),
            },
            "activity": {
                "posts_today": posts_today,
                "comments_today": comments_today,
            },
            "reports": [],
            "privacy": {
                "private_posts_included": False,
                "group_messages_included": False,
                "reports_available": False,
                "message": "No private feeds or Group messages are exposed in this overview.",
            },
        }
    ), 200


@admin_bp.patch("/admin/students/<int:user_id>")
def update_student_identity(user_id):
    """Assign a verified institutional ID to an existing student record."""
    _, error_response = require_university_admin()
    if error_response:
        return error_response

    student = User.query.filter_by(id=user_id, role="student").first()
    if student is None:
        return jsonify({"error": "Student not found."}), 404

    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id")
    if student_id is not None:
        if not isinstance(student_id, str):
            return jsonify({"error": "student_id must be a string."}), 400
        student_id = student_id.strip() or None
        if student_id and len(student_id) > 80:
            return jsonify({"error": "student_id must be 80 characters or fewer."}), 400
        if student_id:
            existing = User.query.filter(
                User.student_id == student_id,
                User.id != student.id,
            ).first()
            if existing:
                return jsonify({"error": "That student ID is already assigned."}), 409
        student.student_id = student_id
    else:
        return jsonify({"error": "student_id is required."}), 400

    db.session.commit()
    return jsonify({"student": serialize_student(student)}), 200


@admin_bp.get("/admin/students")
def list_students():
    """Search student records by institutional ID or public account fields."""
    _, error_response = require_university_admin()
    if error_response:
        return error_response

    search = (request.args.get("search") or "").strip()
    query = User.query.filter(User.role == "student")
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                User.student_id.ilike(pattern),
                User.username.ilike(pattern),
                User.email.ilike(pattern),
                User.first_name.ilike(pattern),
                User.last_name.ilike(pattern),
            )
        )

    students = query.order_by(User.created_at.desc()).limit(50).all()
    return jsonify({"students": [serialize_student(student) for student in students]}), 200
