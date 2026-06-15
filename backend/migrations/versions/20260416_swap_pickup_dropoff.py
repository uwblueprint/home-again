"""swap_pickup_dropoff

Revision ID: 20260416_swap_pickup_dropoff
Revises: 20260416_schema_alignment
Create Date: 2026-04-16

Swap the names of the pickups and dropoffs tables to match corrected semantics:
  - pickup  = collection stop (from donor); links route + donation; furniture items
              reference it via furniture.pickup_id
  - dropoff = delivery stop (to client); links route + furniture + referral; carries
              dispatch flags (high_priority, contact_in_case_of_cancellation, dispatch_required)

Changes:
  - Rename table pickups → dropoffs (was: delivery stop, had furniture_id/referral_id/flags)
  - Rename table dropoffs → pickups (was: collection stop, had route_id only)
  - Rename furniture.dropoff_id → furniture.pickup_id (FK now references new pickups table)
  - Add pickups.donation_id FK → donations.id
"""

import sqlalchemy as sa
from alembic import op

revision = "20260416_swap_pickup_dropoff"
down_revision = "20260416_schema_alignment"
branch_labels = None
depends_on = None


def upgrade():
    # ---------------------------------------------------------------------- #
    # Step 1: Drop furniture.dropoff_id FK constraint before renaming tables
    # ---------------------------------------------------------------------- #
    op.execute(
        "ALTER TABLE furniture DROP CONSTRAINT IF EXISTS fk_furniture_dropoff_id"
    )

    # ---------------------------------------------------------------------- #
    # Step 2: Rename furniture.dropoff_id → furniture.pickup_id
    # ---------------------------------------------------------------------- #
    op.execute("""
        DO $$ BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'furniture' AND column_name = 'dropoff_id'
            ) THEN
                ALTER TABLE furniture RENAME COLUMN dropoff_id TO pickup_id;
            END IF;
        END $$;
    """)

    # ---------------------------------------------------------------------- #
    # Step 3: Swap table names via a temporary name
    # old pickups (delivery stop with furniture_id/referral_id) → dropoffs
    # old dropoffs (collection stop with route_id only)         → pickups
    # ---------------------------------------------------------------------- #
    op.execute("ALTER TABLE pickups RENAME TO _pickups_swap_temp")
    op.execute("ALTER TABLE dropoffs RENAME TO pickups")
    op.execute("ALTER TABLE _pickups_swap_temp RENAME TO dropoffs")

    # ---------------------------------------------------------------------- #
    # Step 4: Add donation_id to new pickups table (formerly dropoffs)
    # ---------------------------------------------------------------------- #
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'pickups' AND column_name = 'donation_id'
            ) THEN
                ALTER TABLE pickups ADD COLUMN donation_id VARCHAR(36);
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_pickups_donation_id'
            ) THEN
                ALTER TABLE pickups ADD CONSTRAINT fk_pickups_donation_id
                    FOREIGN KEY (donation_id) REFERENCES donations(id);
            END IF;
        END $$;
    """)

    # ---------------------------------------------------------------------- #
    # Step 5: Add furniture.pickup_id FK → pickups.id
    # ---------------------------------------------------------------------- #
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_furniture_pickup_id'
            ) THEN
                ALTER TABLE furniture ADD CONSTRAINT fk_furniture_pickup_id
                    FOREIGN KEY (pickup_id) REFERENCES pickups(id);
            END IF;
        END $$;
    """)


def downgrade():
    # Reverse step 5
    op.execute("ALTER TABLE furniture DROP CONSTRAINT IF EXISTS fk_furniture_pickup_id")

    # Reverse step 4
    op.execute("ALTER TABLE pickups DROP CONSTRAINT IF EXISTS fk_pickups_donation_id")
    op.execute("""
        DO $$ BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'pickups' AND column_name = 'donation_id'
            ) THEN
                ALTER TABLE pickups DROP COLUMN donation_id;
            END IF;
        END $$;
    """)

    # Reverse step 3 (swap back)
    op.execute("ALTER TABLE dropoffs RENAME TO _pickups_swap_temp")
    op.execute("ALTER TABLE pickups RENAME TO dropoffs")
    op.execute("ALTER TABLE _pickups_swap_temp RENAME TO pickups")

    # Reverse step 2
    op.execute("""
        DO $$ BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'furniture' AND column_name = 'pickup_id'
            ) THEN
                ALTER TABLE furniture RENAME COLUMN pickup_id TO dropoff_id;
            END IF;
        END $$;
    """)

    # Reverse step 1 — restore furniture.dropoff_id FK → dropoffs.id
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_furniture_dropoff_id'
            ) THEN
                ALTER TABLE furniture ADD CONSTRAINT fk_furniture_dropoff_id
                    FOREIGN KEY (dropoff_id) REFERENCES dropoffs(id);
            END IF;
        END $$;
    """)
