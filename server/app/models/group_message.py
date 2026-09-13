from datetime import datetime, timezone

from app.extensions import db


class GroupMessage(db.Model):
    """A text message posted inside a private Group chat."""

    __tablename__ = "group_messages"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(
        db.Integer,
        db.ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = db.Column(db.String(2000), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    group = db.relationship("Group", back_populates="messages")
    sender = db.relationship("User", foreign_keys=[sender_id])
