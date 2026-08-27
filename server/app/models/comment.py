from datetime import datetime, timezone

from app.extensions import db


class Comment(db.Model):
    """A comment made on a UniFeed post."""

    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
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
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id"),
        nullable=False,
    )

    author = db.relationship("User", back_populates="comments")
    post = db.relationship("Post", back_populates="comments")

    def __repr__(self):
        return f"<Comment {self.id}>"