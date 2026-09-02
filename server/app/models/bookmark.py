from datetime import datetime, timezone

from app.extensions import db


class Bookmark(db.Model):
    """A user's saved post."""

    __tablename__ = "bookmarks"
    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "post_id",
            name="uq_bookmark_user_post",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id"),
        nullable=False,
    )

    user = db.relationship("User", back_populates="bookmarks")
    post = db.relationship("Post", back_populates="bookmarks")

    def __repr__(self):
        return f"<Bookmark user={self.user_id} post={self.post_id}>"
