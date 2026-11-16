"""furniture_position

Revision ID: 20261116_furniture_position
Revises: 20261114_inventory
Create Date: 2026-11-16

Add furniture.position: an item's order within its donation, so a submission's
pieces (e.g. a dining set's table, then its chairs) come back in the order they
were submitted. Rows created in one request can share a created_at on coarse
clocks. Existing rows get 0 and keep ordering by created_at.
"""

import sqlalchemy as sa
from alembic import op

revision = "20261116_furniture_position"
down_revision = "20261114_inventory"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "furniture",
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade():
    op.drop_column("furniture", "position")
