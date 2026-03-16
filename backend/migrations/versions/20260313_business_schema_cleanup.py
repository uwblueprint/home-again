"""business_schema_cleanup

Revision ID: 20260313_business_cleanup
Revises: 1fac88bbbe70
Create Date: 2026-03-13

Drop/rename columns so DB matches current SQLAlchemy models (business fields only).
This is a destructive cleanup migration.
"""

import sqlalchemy as sa
from alembic import op

revision = "20260313_business_cleanup"
down_revision = "1fac88bbbe70"
branch_labels = None
depends_on = None


def upgrade():
    # --- Agencies ---
    op.execute("ALTER TABLE agencies DROP COLUMN email")
    op.execute("ALTER TABLE agencies DROP COLUMN province")
    op.execute("ALTER TABLE agencies DROP COLUMN description")
    op.execute("ALTER TABLE agencies DROP COLUMN status")
    op.execute("ALTER TABLE agencies DROP COLUMN require_pre_payment")
    op.execute("ALTER TABLE agencies DROP COLUMN billing_profiles")
    op.execute("ALTER TABLE agencies RENAME COLUMN address TO address_line_1")
    op.execute("ALTER TABLE agencies ADD COLUMN address_line_2 VARCHAR(255)")
    op.execute("ALTER TABLE agencies ADD COLUMN postal_code VARCHAR(10)")
    op.execute("ALTER TABLE agencies ADD COLUMN main_agent_id VARCHAR(36)")
    op.execute(
        "ALTER TABLE agencies ADD CONSTRAINT agencies_main_agent_id_fkey "
        "FOREIGN KEY (main_agent_id) REFERENCES agents (id)"
    )

    # --- Agents ---
    op.execute("ALTER TABLE agents DROP COLUMN alternate_phone")
    op.execute("ALTER TABLE agents DROP COLUMN extension")
    op.execute("ALTER TABLE agents DROP COLUMN location")
    op.execute("ALTER TABLE agents DROP COLUMN status")

    # --- Donors ---
    op.execute("ALTER TABLE donors DROP COLUMN name")
    op.execute("ALTER TABLE donors DROP COLUMN address")
    op.execute("ALTER TABLE donors DROP COLUMN city")
    op.execute("ALTER TABLE donors DROP COLUMN postal_code")
    op.execute("ALTER TABLE donors DROP COLUMN country")
    op.execute("ALTER TABLE donors DROP COLUMN smoking_household")
    op.execute("ALTER TABLE donors DROP COLUMN donation_type")
    op.execute("ALTER TABLE donors DROP COLUMN is_anonymous")

    # --- Donations ---
    op.create_table(
        "donations",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("donor_id", sa.String(length=36), nullable=False),
        sa.Column("donation_type", sa.String(length=50), nullable=True),
        sa.Column("charitable_receipt_estimate", sa.Float(), nullable=True),
        sa.Column("address_line_1", sa.String(length=255), nullable=True),
        sa.Column("address_line_2", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("postal_code", sa.String(length=10), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["donor_id"], ["donors.id"]),
    )

    # --- Clients ---
    op.execute("ALTER TABLE clients DROP COLUMN email")
    op.execute("ALTER TABLE clients DROP COLUMN address")
    op.execute("ALTER TABLE clients DROP COLUMN apartment_unit")
    op.execute("ALTER TABLE clients DROP COLUMN city")
    op.execute("ALTER TABLE clients DROP COLUMN province")
    op.execute("ALTER TABLE clients DROP COLUMN postal_code")
    op.execute("ALTER TABLE clients DROP COLUMN has_received_furniture_before")
    op.execute("ALTER TABLE clients DROP COLUMN previous_referral_date")
    op.execute("ALTER TABLE clients DROP COLUMN previous_referral_reason")
    op.execute("ALTER TABLE clients DROP COLUMN additional_support_required")
    op.execute("ALTER TABLE clients DROP COLUMN pending_delivery")
    op.execute("ALTER TABLE clients DROP COLUMN last_delivery_date")
    op.execute(
        "ALTER TABLE clients ADD COLUMN coordinated_access_required BOOLEAN NOT NULL DEFAULT FALSE"
    )
    op.execute("ALTER TABLE clients ADD COLUMN immigration_status VARCHAR(50)")
    op.execute("ALTER TABLE clients ALTER COLUMN family_type SET NOT NULL")
    op.execute("ALTER TABLE clients ALTER COLUMN num_children SET NOT NULL")
    op.execute("ALTER TABLE clients ALTER COLUMN num_adults SET NOT NULL")

    # --- Routes ---
    op.execute("ALTER TABLE routes ADD COLUMN status VARCHAR(50)")

    # --- Furniture ---
    op.execute("ALTER TABLE furniture DROP CONSTRAINT furniture_donor_id_fkey")
    op.execute("ALTER TABLE furniture DROP COLUMN donor_id")
    op.execute("ALTER TABLE furniture DROP COLUMN date_donated")
    op.execute("ALTER TABLE furniture DROP COLUMN date_received")
    op.execute("ALTER TABLE furniture DROP COLUMN address_pickup")
    op.execute("ALTER TABLE furniture DROP COLUMN address_dropoff")
    op.execute("ALTER TABLE furniture DROP COLUMN client_id")
    op.execute("ALTER TABLE furniture DROP COLUMN change_log")
    op.execute("ALTER TABLE furniture DROP COLUMN dispatch_id")
    op.execute("ALTER TABLE furniture DROP COLUMN quantity")
    op.execute("ALTER TABLE furniture DROP COLUMN donation_type")
    op.execute("ALTER TABLE furniture DROP COLUMN charitable_receipt_estimate")
    op.execute("ALTER TABLE furniture DROP COLUMN cash_cheque_amount")
    op.execute("ALTER TABLE furniture DROP COLUMN cash_cheque_note")
    op.execute("ALTER TABLE furniture DROP COLUMN admin_note")
    op.execute("ALTER TABLE furniture DROP COLUMN picked_up_or_dropped_off")
    op.execute("ALTER TABLE furniture ADD COLUMN donation_id VARCHAR(36)")
    op.execute("ALTER TABLE furniture ADD COLUMN referral_id VARCHAR(36)")
    op.execute(
        "ALTER TABLE furniture ADD CONSTRAINT furniture_donation_id_fkey "
        "FOREIGN KEY (donation_id) REFERENCES donations (id)"
    )
    op.execute(
        "ALTER TABLE furniture ADD CONSTRAINT furniture_referral_id_fkey "
        "FOREIGN KEY (referral_id) REFERENCES referrals (id)"
    )

    # --- Referrals ---
    op.execute(
        "ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_agency_id_fkey"
    )
    op.execute("ALTER TABLE referrals DROP COLUMN agency_id")
    op.execute("ALTER TABLE referrals ADD COLUMN agent_id VARCHAR(36)")
    op.execute("ALTER TABLE referrals ADD COLUMN secondary_agent_id VARCHAR(36)")
    op.execute(
        "ALTER TABLE referrals ADD COLUMN agents_present_during_delivery BOOLEAN"
    )
    op.execute("ALTER TABLE referrals ADD COLUMN priority_description TEXT")
    op.execute("ALTER TABLE referrals ADD COLUMN previous_city_town_country TEXT")
    op.execute("ALTER TABLE referrals ADD COLUMN address_line_1 VARCHAR(255) NOT NULL")
    op.execute("ALTER TABLE referrals ADD COLUMN address_line_2 VARCHAR(255)")
    op.execute("ALTER TABLE referrals ADD COLUMN city VARCHAR(100) NOT NULL")
    op.execute("ALTER TABLE referrals ADD COLUMN postal_code VARCHAR(10)")
    op.execute("ALTER TABLE referrals ADD COLUMN notes_and_instructions TEXT")
    op.execute(
        "ALTER TABLE referrals ADD CONSTRAINT referrals_agent_id_fkey "
        "FOREIGN KEY (agent_id) REFERENCES agents (id)"
    )
    op.execute(
        "ALTER TABLE referrals ADD CONSTRAINT referrals_secondary_agent_id_fkey "
        "FOREIGN KEY (secondary_agent_id) REFERENCES agents (id)"
    )
    op.execute("ALTER TABLE referrals DROP COLUMN dispatch_required")
    op.execute("ALTER TABLE referrals DROP COLUMN referral_date")
    op.execute("ALTER TABLE referrals DROP COLUMN contact_in_case_of_cancellation")
    op.execute("ALTER TABLE referrals DROP COLUMN coordinated_access_required")
    op.execute("ALTER TABLE referrals DROP COLUMN related_to_move")
    op.execute("ALTER TABLE referrals DROP COLUMN secondary_agent_name")
    op.execute("ALTER TABLE referrals DROP COLUMN secondary_agent_email")
    op.execute("ALTER TABLE referrals DROP COLUMN secondary_agent_phone")


def downgrade():
    raise NotImplementedError("Destructive cleanup migration is not safely reversible.")
