from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db


class User(db.Model):
    """A student or member of the UniFeed community."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=True)
    last_name = db.Column(db.String(80), nullable=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    posts = db.relationship(
        "Post",
        back_populates="author",
        cascade="all, delete-orphan",
    )
    comments = db.relationship(
        "Comment",
        back_populates="author",
        cascade="all, delete-orphan",
    )
    likes = db.relationship(
        "Like",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reposts = db.relationship(
        "Repost",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    bookmarks = db.relationship(
        "Bookmark",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    notifications_received = db.relationship(
        "Notification",
        foreign_keys="Notification.recipient_id",
        back_populates="recipient",
        cascade="all, delete-orphan",
    )
    notifications_sent = db.relationship(
        "Notification",
        foreign_keys="Notification.actor_id",
        back_populates="actor",
        cascade="all, delete-orphan",
    )
    conversations_as_user_one = db.relationship(
        "Conversation",
        foreign_keys="Conversation.user_one_id",
        back_populates="user_one",
        cascade="all, delete-orphan",
    )
    conversations_as_user_two = db.relationship(
        "Conversation",
        foreign_keys="Conversation.user_two_id",
        back_populates="user_two",
        cascade="all, delete-orphan",
    )
    messages_sent = db.relationship(
        "Message",
        back_populates="sender",
        cascade="all, delete-orphan",
    )

    def set_password(self, password):
        """Hash and store a user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Return True when the supplied password matches the stored hash."""
        if not self.password_hash:
            return False

        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"
