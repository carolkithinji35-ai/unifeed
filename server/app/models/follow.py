from datetime import datetime, timezone

from app.extensions import db


class Follow(db.Model):
    """A relationship where one user follows another user."""

    __tablename__ = "follows"

    __table_args__ = (
        db.UniqueConstraint(
            "follower_id",
            "following_id",
            name="uq_follow_follower_following",
        ),
        db.CheckConstraint(
            "follower_id != following_id",
            name="ck_follow_no_self_follow",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    follower_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    following_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    follower = db.relationship(
        "User",
        foreign_keys=[follower_id],
        back_populates="following_relationships",
    )

    following = db.relationship(
        "User",
        foreign_keys=[following_id],
        back_populates="follower_relationships",
    )

    def __repr__(self):
        return (
            f"<Follow follower={self.follower_id} "
            f"following={self.following_id}>"
        )
