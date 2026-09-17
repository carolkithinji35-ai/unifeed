from datetime import datetime, timezone

from app.extensions import db


class Report(db.Model):
    """A private report submitted about a post or comment."""

    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reported_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    comment_id = db.Column(
        db.Integer,
        db.ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    reason = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="pending")
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    reviewed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    reporter = db.relationship("User", foreign_keys=[reporter_id])
    reported_user = db.relationship("User", foreign_keys=[reported_user_id])
    post = db.relationship("Post", back_populates="reports")
    comment = db.relationship("Comment", back_populates="reports")

    __table_args__ = (
        db.CheckConstraint(
            "(post_id IS NOT NULL AND comment_id IS NULL) OR "
            "(post_id IS NULL AND comment_id IS NOT NULL)",
            name="ck_report_one_target",
        ),
    )

    def __repr__(self):
        return f"<Report {self.id}>"
