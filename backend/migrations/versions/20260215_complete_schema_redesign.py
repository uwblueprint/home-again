"""Complete schema redesign: Admin, Agent, Route, Furniture; updated Agency, Client, Donor, Referral. Delivery removed (furniture linked to routes).

Revision ID: 20260215_redesign
Revises: 20260215_hafb
Create Date: 2026-02-15

"""

import sqlalchemy as sa
from alembic import op

revision = "20260215_redesign"
down_revision = "20260215_hafb"
branch_labels = None
depends_on = None


def upgrade():
    # ----- New tables (no FK to altered tables) -----
    op.create_table(
        "admins",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("supabase_user_id", sa.String(255), nullable=True),
        sa.Column("phone_number", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "ix_admins_supabase_user_id", "admins", ["supabase_user_id"], unique=True
    )
    op.create_index("ix_admins_email", "admins", ["email"], unique=True)

    op.create_table(
        "routes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("pickup_furniture_ids", sa.Text(), nullable=True),
        sa.Column("dropoff_furniture_ids", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # ----- Alter agencies -----
    op.add_column("agencies", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("agencies", sa.Column("status", sa.String(50), nullable=True))
    op.add_column(
        "agencies",
        sa.Column("require_pre_payment", sa.Boolean(), server_default="false"),
    )
    op.add_column("agencies", sa.Column("billing_profiles", sa.Text(), nullable=True))
    op.add_column("agencies", sa.Column("created_at", sa.DateTime(), nullable=True))
    op.add_column("agencies", sa.Column("updated_at", sa.DateTime(), nullable=True))
    op.execute(
        'UPDATE agencies SET created_at = "createdAt", updated_at = "updatedAt" WHERE 1=1'
    )
    op.drop_column("agencies", "createdAt")
    op.drop_column("agencies", "updatedAt")

    # ----- Agents (FK agencies) -----
    op.create_table(
        "agents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "agency_id", sa.String(36), sa.ForeignKey("agencies.id"), nullable=False
        ),
        sa.Column("supabase_user_id", sa.String(255), nullable=True),
        sa.Column("phone_number", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("alternate_phone", sa.String(20), nullable=True),
        sa.Column("extension", sa.String(10), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("status", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "ix_agents_supabase_user_id", "agents", ["supabase_user_id"], unique=True
    )

    # ----- Alter donors -----
    op.add_column("donors", sa.Column("first_name", sa.String(100), nullable=True))
    op.add_column("donors", sa.Column("last_name", sa.String(100), nullable=True))
    op.add_column("donors", sa.Column("address", sa.String(255), nullable=True))
    op.add_column("donors", sa.Column("city", sa.String(100), nullable=True))
    op.add_column("donors", sa.Column("postal_code", sa.String(10), nullable=True))
    op.add_column("donors", sa.Column("country", sa.String(100), nullable=True))
    op.add_column("donors", sa.Column("smoking_household", sa.Boolean(), nullable=True))
    op.add_column("donors", sa.Column("donation_type", sa.String(50), nullable=True))
    op.add_column(
        "donors", sa.Column("is_anonymous", sa.Boolean(), server_default="false")
    )
    op.add_column("donors", sa.Column("created_at", sa.DateTime(), nullable=True))
    op.add_column("donors", sa.Column("updated_at", sa.DateTime(), nullable=True))
    op.alter_column("donors", "name", nullable=True)
    op.alter_column("donors", "email", nullable=True)
    op.alter_column("donors", "phone", nullable=True)
    op.execute(
        'UPDATE donors SET created_at = "createdAt", updated_at = "updatedAt" WHERE 1=1'
    )
    op.drop_column("donors", "itemsDonated")
    op.drop_column("donors", "lastDonationDate")
    op.drop_column("donors", "createdAt")
    op.drop_column("donors", "updatedAt")

    # ----- Alter clients -----
    op.add_column("clients", sa.Column("apartment_unit", sa.String(20), nullable=True))
    op.add_column("clients", sa.Column("postal_code", sa.String(10), nullable=True))
    op.add_column("clients", sa.Column("birthday", sa.Date(), nullable=True))
    op.add_column("clients", sa.Column("gender", sa.String(20), nullable=True))
    op.add_column("clients", sa.Column("phone_notes", sa.Text(), nullable=True))
    op.add_column("clients", sa.Column("family_type", sa.String(20), nullable=True))
    op.add_column(
        "clients", sa.Column("num_children", sa.Integer(), server_default="0")
    )
    op.add_column("clients", sa.Column("num_adults", sa.Integer(), server_default="1"))
    op.add_column(
        "clients",
        sa.Column("has_received_furniture_before", sa.Boolean(), nullable=True),
    )
    op.add_column(
        "clients", sa.Column("previous_referral_date", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "clients", sa.Column("previous_referral_reason", sa.Text(), nullable=True)
    )
    op.add_column(
        "clients",
        sa.Column("additional_support_required", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "clients",
        sa.Column(
            "agency_referred_id",
            sa.String(36),
            sa.ForeignKey("agencies.id"),
            nullable=True,
        ),
    )
    op.add_column(
        "clients", sa.Column("pending_delivery", sa.Boolean(), server_default="false")
    )
    op.add_column(
        "clients", sa.Column("last_delivery_date", sa.DateTime(), nullable=True)
    )
    op.add_column("clients", sa.Column("created_at", sa.DateTime(), nullable=True))
    op.add_column("clients", sa.Column("updated_at", sa.DateTime(), nullable=True))
    op.alter_column("clients", "email", nullable=True)
    op.alter_column("clients", "phone", nullable=True)
    # Rename and copy
    op.execute('ALTER TABLE clients RENAME COLUMN "firstName" TO first_name')
    op.execute('ALTER TABLE clients RENAME COLUMN "lastName" TO last_name')
    op.execute('ALTER TABLE clients RENAME COLUMN "agencyId" TO agency_id')
    op.execute(
        'UPDATE clients SET created_at = "createdAt", updated_at = "updatedAt" WHERE 1=1'
    )
    op.drop_column("clients", "createdAt")
    op.drop_column("clients", "updatedAt")

    # ----- Drop inventory, create furniture -----
    op.drop_table("inventory")
    op.create_table(
        "furniture",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("date_donated", sa.DateTime(), nullable=True),
        sa.Column("date_received", sa.DateTime(), nullable=True),
        sa.Column("address_pickup", sa.String(255), nullable=True),
        sa.Column("address_dropoff", sa.String(255), nullable=True),
        sa.Column(
            "client_id", sa.String(36), sa.ForeignKey("clients.id"), nullable=True
        ),
        sa.Column("change_log", sa.Text(), nullable=True),
        sa.Column(
            "dispatch_id", sa.String(36), sa.ForeignKey("routes.id"), nullable=True
        ),
        sa.Column("condition", sa.String(50), nullable=True),
        sa.Column("colour", sa.String(50), nullable=True),
        sa.Column(
            "donor_id", sa.String(36), sa.ForeignKey("donors.id"), nullable=False
        ),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("quantity", sa.Integer(), server_default="1"),
        sa.Column("smoking_household", sa.Boolean(), nullable=True),
        sa.Column("donation_type", sa.String(50), nullable=True),
        sa.Column("charitable_receipt_estimate", sa.Float(), nullable=True),
        sa.Column("cash_cheque_amount", sa.Float(), nullable=True),
        sa.Column("cash_cheque_note", sa.Text(), nullable=True),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("picked_up_or_dropped_off", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # ----- Alter referrals -----
    op.add_column(
        "referrals", sa.Column("dispatch_required", sa.Boolean(), nullable=True)
    )
    op.add_column("referrals", sa.Column("referral_date", sa.DateTime(), nullable=True))
    op.add_column(
        "referrals", sa.Column("is_priority", sa.Boolean(), server_default="false")
    )
    op.add_column(
        "referrals",
        sa.Column(
            "contact_in_case_of_cancellation", sa.Boolean(), server_default="false"
        ),
    )
    op.add_column(
        "referrals",
        sa.Column("coordinated_access_required", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals", sa.Column("date_items_needed", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "referrals", sa.Column("related_to_move", sa.Boolean(), nullable=True)
    )
    op.add_column("referrals", sa.Column("staircases", sa.Boolean(), nullable=True))
    op.add_column(
        "referrals", sa.Column("narrow_passageways", sa.Boolean(), nullable=True)
    )
    op.add_column(
        "referrals", sa.Column("adequate_parking", sa.Boolean(), nullable=True)
    )
    op.add_column("referrals", sa.Column("move_other_info", sa.Text(), nullable=True))
    op.add_column(
        "referrals",
        sa.Column("reason_low_income", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals",
        sa.Column("reason_exiting_homelessness", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals",
        sa.Column("reason_new_to_community", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals",
        sa.Column("reason_escaping_abuse", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals",
        sa.Column("reason_mental_health", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals",
        sa.Column("reason_exiting_prison", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals",
        sa.Column("reason_physical_disability", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals",
        sa.Column("reason_health_issues", sa.Boolean(), server_default="false"),
    )
    op.add_column(
        "referrals", sa.Column("reason_other", sa.Boolean(), server_default="false")
    )
    op.add_column("referrals", sa.Column("reason_other_info", sa.Text(), nullable=True))
    op.add_column(
        "referrals", sa.Column("secondary_agent_name", sa.String(255), nullable=True)
    )
    op.add_column(
        "referrals", sa.Column("secondary_agent_email", sa.String(255), nullable=True)
    )
    op.add_column(
        "referrals", sa.Column("secondary_agent_phone", sa.String(20), nullable=True)
    )
    op.add_column("referrals", sa.Column("created_at", sa.DateTime(), nullable=True))
    op.add_column("referrals", sa.Column("updated_at", sa.DateTime(), nullable=True))
    op.execute('ALTER TABLE referrals RENAME COLUMN "clientId" TO client_id')
    op.execute('ALTER TABLE referrals RENAME COLUMN "agencyId" TO agency_id')
    op.execute(
        'ALTER TABLE referrals RENAME COLUMN "requestedItems" TO requested_items'
    )
    op.execute(
        'UPDATE referrals SET created_at = "createdAt", updated_at = "updatedAt" WHERE 1=1'
    )
    op.drop_column("referrals", "createdAt")
    op.drop_column("referrals", "updatedAt")

    # ----- Drop deliveries (furniture is linked to routes instead) -----
    op.drop_table("deliveries")


def downgrade():
    # ----- Recreate deliveries (for downgrade compatibility) -----
    op.create_table(
        "deliveries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "referralId", sa.String(36), sa.ForeignKey("referrals.id"), nullable=False
        ),
        sa.Column("deliveryDate", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("createdAt", sa.DateTime(), nullable=True),
        sa.Column("updatedAt", sa.DateTime(), nullable=True),
    )

    # ----- Revert referrals -----
    op.add_column("referrals", sa.Column("createdAt", sa.DateTime(), nullable=True))
    op.add_column("referrals", sa.Column("updatedAt", sa.DateTime(), nullable=True))
    op.execute(
        'UPDATE referrals SET "createdAt" = created_at, "updatedAt" = updated_at WHERE 1=1'
    )
    op.drop_column("referrals", "created_at")
    op.drop_column("referrals", "updated_at")
    op.execute('ALTER TABLE referrals RENAME COLUMN client_id TO "clientId"')
    op.execute('ALTER TABLE referrals RENAME COLUMN agency_id TO "agencyId"')
    op.execute(
        'ALTER TABLE referrals RENAME COLUMN requested_items TO "requestedItems"'
    )
    for col in (
        "dispatch_required",
        "referral_date",
        "is_priority",
        "contact_in_case_of_cancellation",
        "coordinated_access_required",
        "date_items_needed",
        "related_to_move",
        "staircases",
        "narrow_passageways",
        "adequate_parking",
        "move_other_info",
        "reason_low_income",
        "reason_exiting_homelessness",
        "reason_new_to_community",
        "reason_escaping_abuse",
        "reason_mental_health",
        "reason_exiting_prison",
        "reason_physical_disability",
        "reason_health_issues",
        "reason_other",
        "reason_other_info",
        "secondary_agent_name",
        "secondary_agent_email",
        "secondary_agent_phone",
    ):
        op.drop_column("referrals", col)

    # ----- Drop furniture, recreate inventory -----
    op.drop_table("furniture")
    op.create_table(
        "inventory",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("quantity", sa.Integer(), default=1),
        sa.Column("condition", sa.String(50), nullable=False),
        sa.Column("donorId", sa.String(36), sa.ForeignKey("donors.id"), nullable=False),
        sa.Column("dateReceived", sa.DateTime(), nullable=False),
        sa.Column("createdAt", sa.DateTime(), nullable=True),
        sa.Column("updatedAt", sa.DateTime(), nullable=True),
    )

    # ----- Revert clients -----
    op.add_column("clients", sa.Column("createdAt", sa.DateTime(), nullable=True))
    op.add_column("clients", sa.Column("updatedAt", sa.DateTime(), nullable=True))
    op.execute(
        'UPDATE clients SET "createdAt" = created_at, "updatedAt" = updated_at WHERE 1=1'
    )
    op.drop_column("clients", "created_at")
    op.drop_column("clients", "updated_at")
    op.execute('ALTER TABLE clients RENAME COLUMN first_name TO "firstName"')
    op.execute('ALTER TABLE clients RENAME COLUMN last_name TO "lastName"')
    op.execute('ALTER TABLE clients RENAME COLUMN agency_id TO "agencyId"')
    op.alter_column("clients", "email", nullable=False)
    op.alter_column("clients", "phone", nullable=False)
    for col in (
        "apartment_unit",
        "postal_code",
        "birthday",
        "gender",
        "phone_notes",
        "family_type",
        "num_children",
        "num_adults",
        "has_received_furniture_before",
        "previous_referral_date",
        "previous_referral_reason",
        "additional_support_required",
        "agency_referred_id",
        "pending_delivery",
        "last_delivery_date",
    ):
        op.drop_column("clients", col)

    # ----- Revert donors -----
    op.add_column("donors", sa.Column("createdAt", sa.DateTime(), nullable=True))
    op.add_column("donors", sa.Column("updatedAt", sa.DateTime(), nullable=True))
    op.add_column("donors", sa.Column("itemsDonated", sa.Integer(), server_default="0"))
    op.add_column("donors", sa.Column("lastDonationDate", sa.DateTime(), nullable=True))
    op.execute(
        'UPDATE donors SET "createdAt" = created_at, "updatedAt" = updated_at WHERE 1=1'
    )
    op.drop_column("donors", "created_at")
    op.drop_column("donors", "updated_at")
    op.drop_column("donors", "first_name")
    op.drop_column("donors", "last_name")
    op.drop_column("donors", "address")
    op.drop_column("donors", "city")
    op.drop_column("donors", "postal_code")
    op.drop_column("donors", "country")
    op.drop_column("donors", "smoking_household")
    op.drop_column("donors", "donation_type")
    op.drop_column("donors", "is_anonymous")
    op.alter_column("donors", "name", nullable=False)
    op.alter_column("donors", "email", nullable=False)
    op.alter_column("donors", "phone", nullable=False)

    # ----- Drop agents -----
    op.drop_table("agents")

    # ----- Revert agencies -----
    op.add_column("agencies", sa.Column("createdAt", sa.DateTime(), nullable=True))
    op.add_column("agencies", sa.Column("updatedAt", sa.DateTime(), nullable=True))
    op.execute(
        'UPDATE agencies SET "createdAt" = created_at, "updatedAt" = updated_at WHERE 1=1'
    )
    op.drop_column("agencies", "created_at")
    op.drop_column("agencies", "updated_at")
    op.drop_column("agencies", "description")
    op.drop_column("agencies", "status")
    op.drop_column("agencies", "require_pre_payment")
    op.drop_column("agencies", "billing_profiles")

    # ----- Drop new tables -----
    op.drop_table("routes")
    op.drop_index("ix_admins_email", table_name="admins")
    op.drop_index("ix_admins_supabase_user_id", table_name="admins")
    op.drop_table("admins")
