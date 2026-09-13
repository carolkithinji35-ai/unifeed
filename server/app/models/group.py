from datetime import datetime, timezone

from app.extensions import db


class Group(db.Model):
    """A private, invite-only UniFeed group."""

    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    creator_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    creator = db.relationship("User", foreign_keys=[creator_id])
    members = db.relationship(
        "GroupMember",
        back_populates="group",
        cascade="all, delete-orphan",
    )


class GroupMember(db.Model):
    """Membership record for a private UniFeed group."""

    __tablename__ = "group_members"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(
        db.Integer,
        db.ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    joined_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    group = db.relationship("Group", back_populates="members")
    user = db.relationship("User")

    __table_args__ = (
        db.UniqueConstraint(
            "group_id",
            "user_id",
            name="uq_group_member_group_user",
        ),
    )
