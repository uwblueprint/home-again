"""rename_furniture_dispatch_id_to_route_id

Revision ID: 2f907bea2c75
Revises: 1fac88bbbe70
Create Date: 2026-03-09 02:50:01.205536

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "2f907bea2c75"
down_revision = "1fac88bbbe70"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint("furniture_dispatch_id_fkey", "furniture", type_="foreignkey")
    op.alter_column(
        "furniture",
        "dispatch_id",
        existing_type=sa.String(length=36),
        existing_nullable=True,
        new_column_name="route_id",
    )
    op.create_foreign_key(
        "furniture_route_id_fkey", "furniture", "routes", ["route_id"], ["id"]
    )


def downgrade():
    op.drop_constraint("furniture_route_id_fkey", "furniture", type_="foreignkey")
    op.alter_column(
        "furniture",
        "route_id",
        existing_type=sa.String(length=36),
        existing_nullable=True,
        new_column_name="dispatch_id",
    )
    op.create_foreign_key(
        "furniture_dispatch_id_fkey", "furniture", "routes", ["dispatch_id"], ["id"]
    )
