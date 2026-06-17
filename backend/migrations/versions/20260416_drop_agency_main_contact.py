"""drop_agency_main_contact

Revision ID: 20260416_agency_contact_drop
Revises: 20260416_swap_pickup_dropoff
Create Date: 2026-04-16

Remove main_contact_first_name and main_contact_last_name from agencies.
Agencies are identified by their group of agents; use Agent.is_admin=True
to designate admin-level agents within an agency.
"""

import sqlalchemy as sa
from alembic import op

revision = "20260416_agency_contact_drop"
down_revision = "20260416_swap_pickup_dropoff"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TABLE agencies DROP COLUMN IF EXISTS main_contact_first_name")
    op.execute("ALTER TABLE agencies DROP COLUMN IF EXISTS main_contact_last_name")


def downgrade():
    op.add_column(
        "agencies", sa.Column("main_contact_first_name", sa.String(100), nullable=True)
    )
    op.add_column(
        "agencies", sa.Column("main_contact_last_name", sa.String(100), nullable=True)
    )
