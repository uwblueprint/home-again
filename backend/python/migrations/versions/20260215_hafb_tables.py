"""HAFB domain tables (agencies, donors, clients, inventory, referrals, deliveries)

Revision ID: 20260215_hafb
Revises: 2adf14c14d9c
Create Date: 2026-02-15

"""

from alembic import op
import sqlalchemy as sa

revision = "20260215_hafb"
down_revision = "2adf14c14d9c"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "agencies",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("address", sa.String(255), nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("province", sa.String(100), nullable=False),
        sa.Column("createdAt", sa.DateTime(), nullable=True),
        sa.Column("updatedAt", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_agencies_email", "agencies", ["email"], unique=True)

    op.create_table(
        "donors",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("itemsDonated", sa.Integer(), default=0),
        sa.Column("lastDonationDate", sa.DateTime(), nullable=True),
        sa.Column("createdAt", sa.DateTime(), nullable=True),
        sa.Column("updatedAt", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_donors_email", "donors", ["email"], unique=True)

    op.create_table(
        "clients",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("firstName", sa.String(100), nullable=False),
        sa.Column("lastName", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("address", sa.String(255), nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("province", sa.String(100), nullable=False),
        sa.Column("agencyId", sa.String(36), sa.ForeignKey("agencies.id"), nullable=True),
        sa.Column("createdAt", sa.DateTime(), nullable=True),
        sa.Column("updatedAt", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_clients_email", "clients", ["email"], unique=True)

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

    op.create_table(
        "referrals",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("clientId", sa.String(36), sa.ForeignKey("clients.id"), nullable=False),
        sa.Column("agencyId", sa.String(36), sa.ForeignKey("agencies.id"), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("requestedItems", sa.Text(), nullable=False),
        sa.Column("createdAt", sa.DateTime(), nullable=True),
        sa.Column("updatedAt", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "deliveries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("referralId", sa.String(36), sa.ForeignKey("referrals.id"), nullable=False),
        sa.Column("deliveryDate", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("createdAt", sa.DateTime(), nullable=True),
        sa.Column("updatedAt", sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table("deliveries")
    op.drop_table("referrals")
    op.drop_table("inventory")
    op.drop_table("clients")
    op.drop_table("donors")
    op.drop_table("agencies")
