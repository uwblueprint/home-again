"""Shared pytest fixtures for integration tests."""

import os
import subprocess
import sys
from pathlib import Path
from uuid import uuid4

# Satisfy prod startup check (DEBUG=False + empty JWKS raises in lifespan).
# Auth tests still override get_current_user / get_jwks_client as needed.
os.environ.setdefault(
    "SUPABASE_JWKS_URL",
    "https://example.test/auth/v1/.well-known/jwks.json",
)

import pytest
# Always run tests in production mode, even if a developer's backend/.env sets
# ENV=DEVELOPMENT; otherwise tokenless requests would pass and hide auth bugs.
# Real environment variables take precedence over the .env file.
os.environ["ENV"] = "PRODUCTION"

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.auth import CurrentUser, get_current_user
from app.config import get_settings
from app.database import get_db
from app.main import create_app
from app.models.base import Base

get_settings.cache_clear()

DATABASE_URL = "sqlite+aiosqlite:///:memory:"

FAKE_USER = CurrentUser(id=uuid4(), email="test@example.com")


@pytest.fixture(scope="session")
def postgres_database():
    """Migrate a disposable database; never modify the configured database."""
    database_url = os.environ.get("TEST_DATABASE_URL")
    if not database_url:
        pytest.skip("Set TEST_DATABASE_URL to run Postgres integration tests")

    url = make_url(database_url)
    if url.get_backend_name() != "postgresql":
        pytest.fail("TEST_DATABASE_URL must point to PostgreSQL")
    url = url.set(drivername="postgresql+psycopg2")
    database_name = f"hafb_test_{uuid4().hex}"
    test_url = url.set(database=database_name)
    backend_dir = Path(__file__).resolve().parents[1]

    def migrate(direction, revision):
        env = {
            **os.environ,
            "DATABASE_URL": test_url.set(drivername="postgresql").render_as_string(
                hide_password=False
            ),
        }
        subprocess.run(
            [sys.executable, "-m", "alembic", direction, revision],
            cwd=backend_dir,
            env=env,
            check=True,
        )

    admin_engine = create_engine(url, isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as connection:
            connection.exec_driver_sql(f'CREATE DATABASE "{database_name}"')
        try:
            migrate("upgrade", "head")
            yield test_url, migrate
        finally:
            with admin_engine.connect() as connection:
                connection.exec_driver_sql(
                    f'DROP DATABASE "{database_name}" WITH (FORCE)'
                )
    finally:
        admin_engine.dispose()


@pytest.fixture(scope="session")
def postgres_engine(postgres_database):
    url, _ = postgres_database
    engine = create_engine(url)
    try:
        yield engine
    finally:
        engine.dispose()


@pytest.fixture
def postgres_connection(postgres_engine):
    with postgres_engine.connect() as connection:
        transaction = connection.begin()
        try:
            yield connection
        finally:
            transaction.rollback()


@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine):
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session):
    """Authenticated test client — overrides get_current_user with a fake user."""
    app = create_app()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def unauthenticated_client(db_session):
    """Client with no auth override — requests have no Bearer token."""
    app = create_app()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac, app
    app.dependency_overrides.clear()
