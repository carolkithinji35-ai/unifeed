from datetime import datetime, timezone

from app.extensions import db


class Conversation(db.Model):
    """A private one-to-one conversation between two users."""

    __tablename__ = "conversations"
    __table_args__ = (
        db.UniqueConstraint(
            "user_one_id",
            "user_two_id",
            name="uq_conversation_users",
        ),
        db.CheckConstraint(
            "user_one_id < user_two_id",
            name="ck_conversation_user_order",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    user_one_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    user_two_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user_one = db.relationship(
        "User",
        foreign_keys=[user_one_id],
        back_populates="conversations_as_user_one",
    )
    user_two = db.relationship(
        "User",
        foreign_keys=[user_two_id],
        back_populates="conversations_as_user_two",
    )
    messages = db.relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at.asc()",
    )

    def __repr__(self):
        return f"<Conversation {self.id}>"
