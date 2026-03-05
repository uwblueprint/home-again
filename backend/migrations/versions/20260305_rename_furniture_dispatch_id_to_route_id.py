"""Rename furniture.dispatch_id to route_id.

Revision ID: 20260305_route_id
Revises: 20260215_redesign
Create Date: 2026-03-05
"""

from alembic import op

revision = "20260305_route_id"
down_revision = "20260215_redesign"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("furniture", "dispatch_id", new_column_name="route_id")

    # Postgres keeps FK constraint names on column rename; rename it for clarity if present.
    op.execute("""
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'furniture'
      AND c.conname = 'furniture_dispatch_id_fkey'
  ) THEN
    ALTER TABLE furniture RENAME CONSTRAINT furniture_dispatch_id_fkey TO furniture_route_id_fkey;
  END IF;
END$$;
""")


def downgrade():
    # Rename FK constraint back if present.
    op.execute("""
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'furniture'
      AND c.conname = 'furniture_route_id_fkey'
  ) THEN
    ALTER TABLE furniture RENAME CONSTRAINT furniture_route_id_fkey TO furniture_dispatch_id_fkey;
  END IF;
END$$;
""")

    op.alter_column("furniture", "route_id", new_column_name="dispatch_id")
