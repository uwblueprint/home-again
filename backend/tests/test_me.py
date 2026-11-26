"""Tests for GET /api/me."""

from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

import app.auth as auth_module
from app.auth import CurrentUser, get_current_user
from app.config import get_settings
from app.database import get_db
from app.main import create_app
from app.models import Admin, Agency, Agent


@pytest_asyncio.fixture
async def make_client(db_session):
    """Build a client whose requests act as the given Supabase user."""
    clients = []

    async def _make(user: CurrentUser) -> AsyncClient:
        app = create_app()

        async def override_get_db():
            yield db_session

        app.dependency_overrides[get_db] = override_get_db
        app.dependency_overrides[get_current_user] = lambda: user
        client = AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
        clients.append(client)
        return client

    yield _make
    for client in clients:
        await client.aclose()


def _user() -> CurrentUser:
    return CurrentUser(id=uuid4(), email="user@example.com")


async def _agency(db_session) -> Agency:
    agency = Agency(
        name="Test Agency",
        address_line_1="1 Main St",
        city="St. John's",
        postal_code="A1A 1A1",
        phone_number="709-555-0100",
    )
    db_session.add(agency)
    await db_session.flush()
    return agency


async def _admin(db_session, supabase_user_id: str | None) -> Admin:
    admin = Admin(
        supabase_user_id=supabase_user_id,
        first_name="Sam",
        last_name="Staff",
        email=f"staff-{uuid4().hex[:8]}@example.com",
        phone_number="709-555-0101",
    )
    db_session.add(admin)
    await db_session.flush()
    return admin


async def _agent(
    db_session, agency: Agency, supabase_user_id: str | None, *, is_admin: bool
) -> Agent:
    agent = Agent(
        agency_id=agency.id,
        supabase_user_id=supabase_user_id,
        first_name="Alex",
        last_name="Agent",
        email=f"agent-{uuid4().hex[:8]}@example.com",
        phone_number="709-555-0102",
        is_admin=is_admin,
    )
    db_session.add(agent)
    await db_session.flush()
    return agent


@pytest.mark.asyncio
async def test_staff_token(make_client, db_session):
    user = _user()
    admin = await _admin(db_session, str(user.id))

    response = await (await make_client(user)).get("/api/me")

    assert response.status_code == 200
    assert response.json() == {
        "role": "staff",
        "id": admin.id,
        "email": admin.email,
        "first_name": "Sam",
        "last_name": "Staff",
        "agency_id": None,
        "is_agency_admin": False,
        "intake_complete": False,
    }


@pytest.mark.asyncio
async def test_agent_token(make_client, db_session):
    user = _user()
    agency = await _agency(db_session)
    agent = await _agent(db_session, agency, str(user.id), is_admin=False)

    response = await (await make_client(user)).get("/api/me")

    assert response.status_code == 200
    assert response.json() == {
        "role": "agent",
        "id": agent.id,
        "email": agent.email,
        "first_name": "Alex",
        "last_name": "Agent",
        "agency_id": agency.id,
        "is_agency_admin": False,
        "intake_complete": True,
    }


@pytest.mark.asyncio
async def test_agency_admin_token(make_client, db_session):
    user = _user()
    agency = await _agency(db_session)
    await _agent(db_session, agency, str(user.id), is_admin=True)

    response = await (await make_client(user)).get("/api/me")

    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "agent"
    assert body["agency_id"] == agency.id
    assert body["is_agency_admin"] is True
    assert body["intake_complete"] is True


@pytest.mark.asyncio
async def test_main_contact_before_intake_is_forbidden(make_client, db_session):
    # Intake creates the agency and the main contact's agents row together, and
    # agents.agency_id is NOT NULL, so a main contact who signs in before
    # finishing intake has no row yet and gets the "no account" 403.
    response = await (await make_client(_user())).get("/api/me")

    assert response.status_code == 403
    assert "Contact Home Again" in response.json()["detail"]


@pytest.mark.asyncio
async def test_valid_token_with_no_row_is_forbidden(make_client, db_session):
    # Rows exist for other users, and unlinked rows (supabase_user_id NULL)
    # must not match anyone.
    agency = await _agency(db_session)
    await _agent(db_session, agency, None, is_admin=True)
    await _admin(db_session, None)
    await _admin(db_session, str(uuid4()))

    response = await (await make_client(_user())).get("/api/me")

    assert response.status_code == 403
    assert "Contact Home Again" in response.json()["detail"]


@pytest.mark.asyncio
async def test_no_token_is_unauthorized(unauthenticated_client):
    client, _app = unauthenticated_client

    response = await client.get("/api/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_dev_user_without_token(unauthenticated_client, db_session, monkeypatch):
    client, _app = unauthenticated_client
    settings = get_settings().model_copy(update={"ENV": "DEVELOPMENT"})
    monkeypatch.setattr(auth_module, "get_settings", lambda: settings)
    admin = await _admin(db_session, settings.DEV_USER_ID)

    response = await client.get("/api/me")

    assert response.status_code == 200
    assert response.json()["role"] == "staff"
    assert response.json()["id"] == admin.id
