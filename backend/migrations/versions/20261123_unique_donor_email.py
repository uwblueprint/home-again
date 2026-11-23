"""unique_donor_email

Revision ID: 20261123_unique_donor_email
Revises: 20261114_inventory
Create Date: 2026-11-23

Make email identify a donor again. The unique index on donors.email was
dropped in 1fac88bbbe70 (the model never declared it), so the same person
could be saved as several donors.

- Trim and lowercase every donor email, matching what the API now stores
- Merge donors that share an email into the earliest one: their donations
  move to it, then the duplicates are deleted
- Add a unique index on donors.email. Legacy rows with no email ('') are
  exempt, since they can't be told apart

Downgrade drops the index; merged donors are not split back out.
"""

import sqlalchemy as sa
from alembic import op

revision = "20261123_unique_donor_email"
down_revision = "20261114_inventory"
branch_labels = None
depends_on = None

# Each donor with an email, paired with the earliest donor sharing it.
DUPLICATES = """
    SELECT id, keep_id FROM (
        SELECT
            id,
            first_value(id) OVER (
                PARTITION BY email ORDER BY created_at NULLS LAST, id
            ) AS keep_id
        FROM donors
        WHERE email <> ''
    ) ranked
    WHERE id <> keep_id
"""


def upgrade():
    op.execute("UPDATE donors SET email = lower(trim(email))")
    op.execute(f"""
        UPDATE donations SET donor_id = dup.keep_id
        FROM ({DUPLICATES}) dup
        WHERE donations.donor_id = dup.id
        """)
    op.execute(f"DELETE FROM donors WHERE id IN (SELECT id FROM ({DUPLICATES}) dup)")
    op.create_index(
        "ix_donors_email",
        "donors",
        ["email"],
        unique=True,
        postgresql_where=sa.text("email <> ''"),
    )


def downgrade():
    op.drop_index("ix_donors_email", table_name="donors")
