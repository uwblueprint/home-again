"""unique_agent_email

Revision ID: 20261123_unique_agent_email
Revises: 20261123_unique_donor_email
Create Date: 2026-11-23

Make agents.email unique ignoring case, so an invite always matches exactly
one agent. Emails stay as entered; the index is on lower(email).

- Trim whitespace from existing agent emails, matching what the API now stores
- Stop with a list of the duplicate emails if any exist. Agents can't be merged
  automatically (each has its own referrals and Supabase login), so clean them
  up by hand, then rerun
- Add the unique index ix_agents_email_lower on lower(email)

Downgrade drops the index.
"""

import sqlalchemy as sa
from alembic import op

revision = "20261123_unique_agent_email"
down_revision = "20261123_unique_donor_email"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    connection.execute(sa.text("UPDATE agents SET email = trim(email)"))
    duplicates = connection.execute(
        sa.text(
            "SELECT lower(email), count(*) FROM agents "
            "GROUP BY lower(email) HAVING count(*) > 1 ORDER BY 1"
        )
    ).all()
    if duplicates:
        listed = ", ".join(f"{email} ({count})" for email, count in duplicates)
        raise RuntimeError(
            "agents.email must be unique ignoring case. Remove or change the "
            f"duplicate agents first: {listed}"
        )
    op.create_index(
        "ix_agents_email_lower",
        "agents",
        [sa.text("lower(email)")],
        unique=True,
    )


def downgrade():
    op.drop_index("ix_agents_email_lower", table_name="agents")
