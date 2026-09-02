from datetime import datetime, timezone

from app.extensions import db


class Message(db.Model):
    """A text message inside a private conversation."""

    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)

    conversation_id = db.Column(
        db.Integer,
        db.ForeignKey("conversations.id"),
        nullable=False,
    )
    sender_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    conversation = db.relationship(
        "Conversation",
        back_populates="messages",
    )
    sender = db.relationship(
        "User",
        back_populates="messages_sent",
    )

    def __repr__(self):
        return f"<Message {self.id}>"
