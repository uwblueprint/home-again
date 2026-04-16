"""schema_alignment

Revision ID: 20260416_schema_alignment
Revises: 20260313_business_cleanup
Create Date: 2026-04-16

Align database schema to updated client requirements:
- Tighten nullable constraints on Admin, Agent, Donor, Client, Agency, Furniture
- Add new columns: Agency.main_contact_*, Agency.program, Agent.is_admin,
  Client.speaks_english/language, Furniture.has_pets/dropoff_id, Referral.program
- Remove deprecated columns: Agency.main_agent_id, Furniture.client_id/route_id/
  change_log/date_donated/date_received/address_pickup/address_dropoff,
  Route.pickup_furniture_ids/dropoff_furniture_ids
- Rename Agency.phone → Agency.phone_number for naming consistency
- Create new tables: dropoffs, pickups
"""

import sqlalchemy as sa
from alembic import op

revision = "20260416_schema_alignment"
down_revision = "2f907bea2c75"
branch_labels = None
depends_on = None


def upgrade():
    # ------------------------------------------------------------------ #
    # Admin — tighten nullability
    # ------------------------------------------------------------------ #
    op.alter_column("admins", "email", existing_type=sa.String(255), nullable=False)
    op.alter_column("admins", "phone_number", existing_type=sa.String(20), nullable=False)

    # ------------------------------------------------------------------ #
    # Agency — add new columns, remove main_agent_id, rename phone
    # ------------------------------------------------------------------ #
    op.add_column("agencies", sa.Column("main_contact_first_name", sa.String(100), nullable=True))
    op.add_column("agencies", sa.Column("main_contact_last_name", sa.String(100), nullable=True))
    op.add_column("agencies", sa.Column("program", sa.String(255), nullable=True))

    # Populate main_contact fields from existing data (set to placeholder so NOT NULL works)
    op.execute("UPDATE agencies SET main_contact_first_name = 'Unknown' WHERE main_contact_first_name IS NULL")
    op.execute("UPDATE agencies SET main_contact_last_name = 'Unknown' WHERE main_contact_last_name IS NULL")

    op.alter_column("agencies", "main_contact_first_name", existing_type=sa.String(100), nullable=False)
    op.alter_column("agencies", "main_contact_last_name", existing_type=sa.String(100), nullable=False)
    op.alter_column("agencies", "postal_code", existing_type=sa.String(10), nullable=False)

    # Rename phone → phone_number if phone still exists; otherwise phone_number is already correct
    op.execute("""
        DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name='agencies' AND column_name='phone') THEN
                ALTER TABLE agencies RENAME COLUMN phone TO phone_number;
            END IF;
        END $$;
    """)

    # Drop main_agent_id FK and column (IF EXISTS — may not exist in all envs)
    op.execute("ALTER TABLE agencies DROP CONSTRAINT IF EXISTS agencies_main_agent_id_fkey")
    op.execute("ALTER TABLE agencies DROP COLUMN IF EXISTS main_agent_id")

    # ------------------------------------------------------------------ #
    # Agent — tighten nullability, add is_admin
    # ------------------------------------------------------------------ #
    op.alter_column("agents", "email", existing_type=sa.String(255), nullable=False)
    op.alter_column("agents", "phone_number", existing_type=sa.String(20), nullable=False)
    op.add_column("agents", sa.Column("is_admin", sa.Boolean(), nullable=True))
    op.execute("UPDATE agents SET is_admin = FALSE WHERE is_admin IS NULL")
    op.alter_column("agents", "is_admin", existing_type=sa.Boolean(), nullable=False)

    # ------------------------------------------------------------------ #
    # Donor — tighten nullability
    # ------------------------------------------------------------------ #
    op.execute("UPDATE donors SET first_name = '' WHERE first_name IS NULL")
    op.execute("UPDATE donors SET last_name = '' WHERE last_name IS NULL")
    op.execute("UPDATE donors SET email = '' WHERE email IS NULL")
    op.execute("UPDATE donors SET phone = '' WHERE phone IS NULL")
    op.alter_column("donors", "first_name", existing_type=sa.String(100), nullable=False)
    op.alter_column("donors", "last_name", existing_type=sa.String(100), nullable=False)
    op.alter_column("donors", "email", existing_type=sa.String(255), nullable=False)
    op.alter_column("donors", "phone", existing_type=sa.String(20), nullable=False)

    # ------------------------------------------------------------------ #
    # Client — tighten birthday, add language fields
    # ------------------------------------------------------------------ #
    op.execute("UPDATE clients SET birthday = '1900-01-01' WHERE birthday IS NULL")
    op.alter_column("clients", "birthday", existing_type=sa.Date(), nullable=False)
    op.add_column("clients", sa.Column("speaks_english", sa.Boolean(), nullable=True))
    op.execute("UPDATE clients SET speaks_english = TRUE WHERE speaks_english IS NULL")
    op.alter_column("clients", "speaks_english", existing_type=sa.Boolean(), nullable=False)
    op.add_column("clients", sa.Column("language", sa.String(100), nullable=True))

    # ------------------------------------------------------------------ #
    # Furniture — tighten nullability, add new columns, drop old columns
    # ------------------------------------------------------------------ #
    op.execute("UPDATE furniture SET image_url = '' WHERE image_url IS NULL")
    op.execute("UPDATE furniture SET description = '' WHERE description IS NULL")
    op.execute("UPDATE furniture SET colour = '' WHERE colour IS NULL")
    op.execute("UPDATE furniture SET category = '' WHERE category IS NULL")
    op.execute("UPDATE furniture SET smoking_household = FALSE WHERE smoking_household IS NULL")

    op.alter_column("furniture", "image_url", existing_type=sa.String(500), nullable=False)
    op.alter_column("furniture", "description", existing_type=sa.Text(), nullable=False)
    op.alter_column("furniture", "colour", existing_type=sa.String(50), nullable=False)
    op.alter_column("furniture", "category", existing_type=sa.String(100), nullable=False)
    op.alter_column("furniture", "smoking_household", existing_type=sa.Boolean(), nullable=False)

    op.add_column("furniture", sa.Column("has_pets", sa.Boolean(), nullable=True))
    op.execute("UPDATE furniture SET has_pets = FALSE WHERE has_pets IS NULL")
    op.alter_column("furniture", "has_pets", existing_type=sa.Boolean(), nullable=False)

    # Drop deprecated columns from furniture (IF EXISTS — some were already removed by earlier migrations)
    for col in ("client_id", "route_id", "change_log", "date_donated",
                "date_received", "address_pickup", "address_dropoff"):
        op.execute(f"ALTER TABLE furniture DROP COLUMN IF EXISTS {col}")

    # ------------------------------------------------------------------ #
    # Referral — add program
    # ------------------------------------------------------------------ #
    op.add_column("referrals", sa.Column("program", sa.String(255), nullable=True))

    # ------------------------------------------------------------------ #
    # Route — drop JSON text array columns (IF EXISTS)
    # ------------------------------------------------------------------ #
    for col in ("pickup_furniture_ids", "dropoff_furniture_ids"):
        op.execute(f"ALTER TABLE routes DROP COLUMN IF EXISTS {col}")

    # ------------------------------------------------------------------ #
    # Create dropoffs table (before pickups + furniture FK)
    # ------------------------------------------------------------------ #
    op.execute("""
        CREATE TABLE IF NOT EXISTS dropoffs (
            id VARCHAR(36) PRIMARY KEY,
            route_id VARCHAR(36) NOT NULL REFERENCES routes(id),
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)

    # ------------------------------------------------------------------ #
    # Add dropoff_id FK to furniture (IF NOT EXISTS)
    # ------------------------------------------------------------------ #
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name='furniture' AND column_name='dropoff_id') THEN
                ALTER TABLE furniture ADD COLUMN dropoff_id VARCHAR(36);
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_furniture_dropoff_id') THEN
                ALTER TABLE furniture ADD CONSTRAINT fk_furniture_dropoff_id
                    FOREIGN KEY (dropoff_id) REFERENCES dropoffs (id);
            END IF;
        END $$;
    """)

    # ------------------------------------------------------------------ #
    # Create pickups table
    # ------------------------------------------------------------------ #
    op.execute("""
        CREATE TABLE IF NOT EXISTS pickups (
            id VARCHAR(36) PRIMARY KEY,
            route_id VARCHAR(36) NOT NULL REFERENCES routes(id),
            furniture_id VARCHAR(36) NOT NULL REFERENCES furniture(id),
            referral_id VARCHAR(36) REFERENCES referrals(id),
            high_priority BOOLEAN NOT NULL DEFAULT FALSE,
            contact_in_case_of_cancellation BOOLEAN NOT NULL DEFAULT FALSE,
            dispatch_required BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)


def downgrade():
    # Reverse in opposite order
    op.drop_table("pickups")
    op.drop_constraint("fk_furniture_dropoff_id", "furniture", type_="foreignkey")
    op.drop_column("furniture", "dropoff_id")
    op.drop_table("dropoffs")

    op.add_column("routes", sa.Column("pickup_furniture_ids", sa.Text(), nullable=True))
    op.add_column("routes", sa.Column("dropoff_furniture_ids", sa.Text(), nullable=True))

    op.drop_column("referrals", "program")
    op.drop_column("clients", "language")
    op.alter_column("clients", "speaks_english", existing_type=sa.Boolean(), nullable=True)
    op.drop_column("clients", "speaks_english")
    op.alter_column("clients", "birthday", existing_type=sa.Date(), nullable=True)

    op.drop_column("agents", "is_admin")

    op.alter_column("agencies", "phone_number", new_column_name="phone", existing_type=sa.String(20), nullable=True)
    op.add_column("agencies", sa.Column("main_agent_id", sa.String(36), nullable=True))
    op.drop_column("agencies", "program")
    op.drop_column("agencies", "main_contact_last_name")
    op.drop_column("agencies", "main_contact_first_name")

    op.drop_column("furniture", "has_pets")
