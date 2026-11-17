"""Enable row level security on every application table.

Revision ID: 20261105_public_rls
Revises: 20260724_donation_review
Create Date: 2026-11-05

Enable Row Level Security for all 13 tables including:
- admins
- agencies
- agents
- donors
- donations
- clients
- routes
- pickups
- furniture
- furniture_photos
- referrals, dropoffs
- alembic_version

Changes:
- Toggle RLS on for all above tables
- No policies added, left FORCE RLS disabled
- Downgrade disables RLS for all relevant tables
"""

from alembic import op

revision = "20261105_public_rls"
down_revision = "20260724_donation_review"
branch_labels = None
depends_on = None

TABLES = (
    "admins",
    "agencies",
    "agents",
    "donors",
    "donations",
    "clients",
    "routes",
    "pickups",
    "furniture",
    "furniture_photos",
    "referrals",
    "dropoffs",
    "alembic_version",
)


def upgrade():
    # No policies: ordinary API roles cannot access rows. Do not FORCE RLS;
    # the backend and Alembic connect as the table owner and retain access.
    for table in TABLES:
        op.execute(f'ALTER TABLE public."{table}" ENABLE ROW LEVEL SECURITY')


def downgrade():
    for table in TABLES:
        op.execute(f'ALTER TABLE public."{table}" DISABLE ROW LEVEL SECURITY')
