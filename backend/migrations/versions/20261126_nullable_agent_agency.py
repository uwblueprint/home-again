"""nullable_agent_agency

Revision ID: 20261126_nullable_agent_agency
Revises: 20261123_unique_agent_email
Create Date: 2026-11-26

Make agents.agency_id nullable, so a main contact can have an agents row (and
sign in) before intake creates their agency. GET /api/me reports these users
with agency_id null and intake_complete false.

Downgrade restores NOT NULL. It stops with the agent ids if any agent has no
agency, since there's no agency to assign them automatically; delete those
agents or give them an agency, then rerun.
"""

import sqlalchemy as sa
from alembic import op

revision = "20261126_nullable_agent_agency"
down_revision = "20261123_unique_agent_email"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "agents", "agency_id", existing_type=sa.String(length=36), nullable=True
    )


def downgrade():
    orphans = (
        op.get_bind()
        .execute(sa.text("SELECT id FROM agents WHERE agency_id IS NULL ORDER BY id"))
        .scalars()
        .all()
    )
    if orphans:
        raise RuntimeError(
            "agents.agency_id can't be made NOT NULL while agents have no agency. "
            f"Delete them or set an agency first: {', '.join(orphans)}"
        )
    op.alter_column(
        "agents", "agency_id", existing_type=sa.String(length=36), nullable=False
    )
