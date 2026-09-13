from datetime import datetime, timezone

from app.extensions import db


class GroupInvite(db.Model):
    """A revocable, expiring invite link for a private Group."""

    __tablename__ = "group_invites"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(
        db.Integer,
        db.ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    token = db.Column(db.String(128), unique=True, nullable=False, index=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    revoked_at = db.Column(db.DateTime(timezone=True), nullable=True)

    group = db.relationship("Group", back_populates="invites")
    created_by = db.relationship("User", foreign_keys=[created_by_id])

    @property
    def is_active(self):
        now = datetime.now(timezone.utc)
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return self.revoked_at is None and expires_at > now
