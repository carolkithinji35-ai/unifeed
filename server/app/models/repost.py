from datetime import datetime, timezone

from app.extensions import db


class Repost(db.Model):
    """A user's repost of a post."""

    __tablename__ = "reposts"
    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "post_id",
            name="uq_repost_user_post",
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

    user = db.relationship("User", back_populates="reposts")
    post = db.relationship("Post", back_populates="reposts")

    def __repr__(self):
        return f"<Repost user={self.user_id} post={self.post_id}>"
