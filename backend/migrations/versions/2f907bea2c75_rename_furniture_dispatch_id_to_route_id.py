"""rename_furniture_dispatch_id_to_route_id

Revision ID: 2f907bea2c75
Revises: 20260313_business_cleanup
Create Date: 2026-03-09 02:50:01.205536

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "2f907bea2c75"
down_revision = "20260313_business_cleanup"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("furniture")}

    # If dispatch_id still exists, perform the original rename path.
    if "dispatch_id" in columns:
        op.execute(
            "ALTER TABLE furniture DROP CONSTRAINT IF EXISTS furniture_dispatch_id_fkey"
        )
        op.alter_column(
            "furniture",
            "dispatch_id",
            existing_type=sa.String(length=36),
            existing_nullable=True,
            new_column_name="route_id",
        )
    # If cleanup already dropped dispatch_id, add route_id directly.
    elif "route_id" not in columns:
        op.add_column(
            "furniture", sa.Column("route_id", sa.String(length=36), nullable=True)
        )

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'furniture_route_id_fkey'
            ) THEN
                ALTER TABLE furniture
                ADD CONSTRAINT furniture_route_id_fkey
                FOREIGN KEY (route_id) REFERENCES routes (id);
            END IF;
        END $$;
        """)


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("furniture")}

    op.execute(
        "ALTER TABLE furniture DROP CONSTRAINT IF EXISTS furniture_route_id_fkey"
    )

    if "route_id" in columns:
        op.alter_column(
            "furniture",
            "route_id",
            existing_type=sa.String(length=36),
            existing_nullable=True,
            new_column_name="dispatch_id",
        )
        op.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'furniture_dispatch_id_fkey'
                ) THEN
                    ALTER TABLE furniture
                    ADD CONSTRAINT furniture_dispatch_id_fkey
                    FOREIGN KEY (dispatch_id) REFERENCES routes (id);
                END IF;
            END $$;
            """)
