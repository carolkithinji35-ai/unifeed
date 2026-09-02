from datetime import datetime, timezone

from app.extensions import db


class Notification(db.Model):
    """An activity notification shown to a user."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    recipient_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    actor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id"),
        nullable=True,
    )

    notification_type = db.Column(db.String(30), nullable=False)
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    recipient = db.relationship(
        "User",
        foreign_keys=[recipient_id],
        back_populates="notifications_received",
    )
    actor = db.relationship(
        "User",
        foreign_keys=[actor_id],
        back_populates="notifications_sent",
    )
    post = db.relationship("Post", back_populates="notifications")

    def __repr__(self):
        return (
            f"<Notification recipient={self.recipient_id} "
            f"type={self.notification_type}>"
        )
