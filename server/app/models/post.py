from datetime import datetime, timezone

from app.extensions import db


class Post(db.Model):
    """A post shared in the campus feed."""

    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    author_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    author = db.relationship("User", back_populates="posts")
    comments = db.relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan",
    )
    likes = db.relationship(
        "Like",
        back_populates="post",
        cascade="all, delete-orphan",
    )
    reposts = db.relationship(
        "Repost",
        back_populates="post",
        cascade="all, delete-orphan",
    )
    bookmarks = db.relationship(
        "Bookmark",
        back_populates="post",
        cascade="all, delete-orphan",
    )
    notifications = db.relationship(
        "Notification",
        back_populates="post",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Post {self.id}>"
