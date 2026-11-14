"""referral_items

Revision ID: 20261113_referral_items
Revises: 20261105_public_rls
Create Date: 2026-11-13

Add referral_items: one row per requested unit on a referral, so each unit has
its own review status and the referral's status can be derived from them (like
a donation's from its furniture).

- Create referral_items and enable RLS on it, like every other public table
- Backfill rows from each referral's requested_items JSON ("Sofa" × 2 → two
  rows). referrals.requested_items stays as the agent's original request.
- Existing referrals have no per-unit decisions, so each unit takes its
  referral's status: declined → REJECTED, approved (shown as "waitlisted") →
  WAITLISTED, completed → DELIVERED, anything else → PENDING_REVIEW
"""

import json
import uuid

import sqlalchemy as sa
from alembic import op

revision = "20261113_referral_items"
down_revision = "20261105_public_rls"
branch_labels = None
depends_on = None

STATUS_FROM_REFERRAL = {
    "declined": "REJECTED",
    "approved": "WAITLISTED",
    "completed": "DELIVERED",
}


def _quantity(entry):
    try:
        return max(1, int(entry.get("quantity") or 1))
    except (TypeError, ValueError):
        return 1


def upgrade():
    referral_items = op.create_table(
        "referral_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "referral_id",
            sa.String(36),
            sa.ForeignKey("referrals.id", name="referral_items_referral_id_fkey"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("size", sa.String(50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column(
            "furniture_id",
            sa.String(36),
            sa.ForeignKey("furniture.id", name="referral_items_furniture_id_fkey"),
            nullable=True,
            unique=True,
        ),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_referral_items_referral_id", "referral_items", ["referral_id"])
    op.execute('ALTER TABLE public."referral_items" ENABLE ROW LEVEL SECURITY')

    referrals_table = sa.table(
        "referrals",
        sa.column("id", sa.String),
        sa.column("requested_items", sa.Text),
        sa.column("status", sa.String),
        sa.column("created_at", sa.DateTime),
        sa.column("updated_at", sa.DateTime),
    )
    referrals = op.get_bind().execute(sa.select(referrals_table)).mappings().all()
    rows = []
    for referral in referrals:
        try:
            requested = json.loads(referral["requested_items"] or "[]")
        except (TypeError, ValueError):
            requested = []
        status = STATUS_FROM_REFERRAL.get(referral["status"], "PENDING_REVIEW")
        position = 0
        for entry in requested if isinstance(requested, list) else []:
            if not isinstance(entry, dict):
                entry = {"item": str(entry)}
            name = str(
                entry.get("item") or entry.get("name") or entry.get("type") or "Item"
            ).strip()
            for _ in range(_quantity(entry)):
                rows.append(
                    {
                        "id": str(uuid.uuid4()),
                        "referral_id": referral["id"],
                        "name": name[:255],
                        "size": entry.get("size"),
                        "notes": entry.get("notes"),
                        "status": status,
                        "reviewed_at": (
                            None
                            if status == "PENDING_REVIEW"
                            else referral["updated_at"]
                        ),
                        "position": position,
                        "created_at": referral["created_at"],
                        "updated_at": referral["updated_at"],
                    }
                )
                position += 1
    if rows:
        op.bulk_insert(referral_items, rows)


def downgrade():
    op.drop_index("ix_referral_items_referral_id", table_name="referral_items")
    op.drop_table("referral_items")
