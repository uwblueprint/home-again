"""donation_review_flow

Revision ID: 20260724_donation_review
Revises: 20260416_agency_contact_drop
Create Date: 2026-07-24

Support the admin donation-request review flow:
- Furniture.rejection_reason/rejection_details/reviewed_at — record why an item
  was rejected and when it was reviewed
- New furniture_photos table — donors submit several photos per item, ordered
- Pickup.scheduled_date/note/confirmed_at — a pickup is scheduled against a
  donation during review and later confirmed with the donor
- Pickup.route_id relaxed to nullable — a pickup exists before dispatch assigns
  it to a route
- Donation.smoking_household/has_pets — household questions are asked once on
  the donor form, so they belong at the donation level
"""

import sqlalchemy as sa
from alembic import op

revision = "20260724_donation_review"
down_revision = "20260416_agency_contact_drop"
branch_labels = None
depends_on = None


def upgrade():
    # ------------------------------------------------------------------ #
    # Donation — household questions
    # ------------------------------------------------------------------ #
    op.add_column(
        "donations", sa.Column("smoking_household", sa.Boolean(), nullable=True)
    )
    op.add_column("donations", sa.Column("has_pets", sa.Boolean(), nullable=True))

    # ------------------------------------------------------------------ #
    # Furniture — item review outcome
    # ------------------------------------------------------------------ #
    op.add_column(
        "furniture", sa.Column("rejection_reason", sa.String(50), nullable=True)
    )
    op.add_column("furniture", sa.Column("rejection_details", sa.Text(), nullable=True))
    op.add_column("furniture", sa.Column("reviewed_at", sa.DateTime(), nullable=True))

    # ------------------------------------------------------------------ #
    # Furniture photos — ordered photo set per item
    # ------------------------------------------------------------------ #
    op.create_table(
        "furniture_photos",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "furniture_id",
            sa.String(36),
            sa.ForeignKey("furniture.id"),
            nullable=False,
        ),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "ix_furniture_photos_furniture_id", "furniture_photos", ["furniture_id"]
    )

    # Seed the new table from the existing single-image column so no photo is lost.
    # gen_random_uuid() is built into Postgres 13+ (docker-compose runs 15).
    op.execute("""
        INSERT INTO furniture_photos
            (id, furniture_id, url, position, created_at, updated_at)
        SELECT
            gen_random_uuid()::text,
            id,
            image_url,
            0,
            NOW(),
            NOW()
        FROM furniture
        WHERE image_url IS NOT NULL AND image_url <> ''
        """)

    # ------------------------------------------------------------------ #
    # Pickup — scheduling and donor confirmation
    # ------------------------------------------------------------------ #
    op.add_column("pickups", sa.Column("scheduled_date", sa.DateTime(), nullable=True))
    op.add_column("pickups", sa.Column("note", sa.Text(), nullable=True))
    op.add_column("pickups", sa.Column("confirmed_at", sa.DateTime(), nullable=True))
    op.alter_column("pickups", "route_id", existing_type=sa.String(36), nullable=True)


def downgrade():
    # Pickups scheduled during review have no route yet and cannot satisfy the
    # restored NOT NULL, so they are dropped. Downgrading loses that scheduling,
    # and dropping furniture_photos below loses every photo — not just the ones
    # seeded from image_url on the way up.
    #
    # Items already assigned to one of those pickups have to be detached first,
    # or the delete trips fk_furniture_pickup_id and the whole downgrade aborts.
    op.execute("""
        UPDATE furniture SET pickup_id = NULL
        WHERE pickup_id IN (SELECT id FROM pickups WHERE route_id IS NULL)
        """)
    op.execute("DELETE FROM pickups WHERE route_id IS NULL")
    op.alter_column("pickups", "route_id", existing_type=sa.String(36), nullable=False)
    op.drop_column("pickups", "confirmed_at")
    op.drop_column("pickups", "note")
    op.drop_column("pickups", "scheduled_date")

    op.drop_index("ix_furniture_photos_furniture_id", table_name="furniture_photos")
    op.drop_table("furniture_photos")

    op.drop_column("furniture", "reviewed_at")
    op.drop_column("furniture", "rejection_details")
    op.drop_column("furniture", "rejection_reason")

    op.drop_column("donations", "has_pets")
    op.drop_column("donations", "smoking_household")
