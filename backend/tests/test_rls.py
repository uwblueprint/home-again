"""PostgreSQL security checks against the real Alembic schema."""

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.schemas import DonorCreate, DonorUpdate
from app.services import donors

pytestmark = pytest.mark.postgres

EXPECTED_TABLES = {
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
}


def assert_public_tables_have_rls(connection):
    unsecured = (
        connection.execute(
            text(
                "SELECT tablename FROM pg_tables "
                "WHERE schemaname = 'public' AND rowsecurity = false "
                "ORDER BY tablename"
            )
        )
        .scalars()
        .all()
    )
    assert not unsecured, "Public tables missing RLS: " + ", ".join(unsecured)


def test_all_public_tables_have_rls(postgres_connection):
    tables = set(
        postgres_connection.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        ).scalars()
    )
    assert EXPECTED_TABLES <= tables
    assert_public_tables_have_rls(postgres_connection)


def test_rls_guard_names_every_unsecured_table(postgres_connection):
    # A public table is needed: a TEMP table lives outside the public schema.
    # The fixture rolls this transaction back, including both CREATEs.
    postgres_connection.execute(text("CREATE TABLE public.rls_probe_a (id integer)"))
    postgres_connection.execute(text("CREATE TABLE public.rls_probe_b (id integer)"))
    with pytest.raises(AssertionError) as error:
        assert_public_tables_have_rls(postgres_connection)
    assert "rls_probe_a" in str(error.value)
    assert "rls_probe_b" in str(error.value)


def test_rls_has_no_policies_or_force(postgres_connection):
    assert not postgres_connection.execute(
        text("SELECT tablename FROM pg_policies WHERE schemaname = 'public'")
    ).all()
    assert not postgres_connection.execute(
        text(
            "SELECT c.relname FROM pg_class c "
            "JOIN pg_namespace n ON n.oid = c.relnamespace "
            "WHERE n.nspname = 'public' AND c.relforcerowsecurity"
        )
    ).all()


def test_rls_migration_downgrade_and_upgrade(postgres_database, postgres_engine):
    _, migrate = postgres_database
    try:
        migrate("downgrade", "20260724_donation_review")
        with postgres_engine.connect() as connection:
            enabled = (
                connection.execute(
                    text(
                        "SELECT tablename FROM pg_tables "
                        "WHERE schemaname = 'public' AND rowsecurity"
                    )
                )
                .scalars()
                .all()
            )
            assert not enabled, f"Tables still have RLS after downgrade: {enabled}"
    finally:
        migrate("upgrade", "head")
    with postgres_engine.connect() as connection:
        assert_public_tables_have_rls(connection)


async def test_backend_owner_can_read_and_write(postgres_database):
    url, _ = postgres_database
    engine = create_async_engine(url.set(drivername="postgresql+asyncpg"))
    try:
        async with engine.connect() as connection:
            transaction = await connection.begin()
            try:
                # Exercise the application's actual CRUD services, including
                # their commits, while keeping test data inside a rollback.
                async with AsyncSession(
                    bind=connection,
                    expire_on_commit=False,
                    join_transaction_mode="create_savepoint",
                ) as session:
                    donor = await donors.create_donor(
                        session,
                        DonorCreate(
                            first_name="RLS",
                            last_name="Test",
                            email="rls@example.test",
                            phone="555-0100",
                        ),
                    )
                    donor_id = donor.id
                    assert await donors.get_donor(session, donor_id) is not None
                    updated = await donors.update_donor(
                        session, donor, DonorUpdate(first_name="Updated")
                    )
                    assert updated.first_name == "Updated"
                    await donors.delete_donor(session, updated)
                    assert await donors.get_donor(session, donor_id) is None
            finally:
                await transaction.rollback()
    finally:
        await engine.dispose()
