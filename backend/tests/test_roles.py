"""Role dependency tests using fake Auth users and seeded SQLite rows."""

from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import Depends, FastAPI
from httpx import ASGITransport, AsyncClient

from app.auth import CurrentUser, get_current_user
from app.database import get_db
from app.models import Admin, Agency, Agent
from app.roles import require_agency_admin, require_staff


@pytest.fixture
async def role_data(db_session):
    users = {
        role: CurrentUser(id=uuid4(), email=f"{role}@example.com")
        for role in (
            "staff",
            "agency_admin",
            "agent",
            "other_agency_admin",
            "missing",
            "unlinked_staff",
            "unlinked_agent",
        )
    }
    agencies = [
        Agency(
            id=str(uuid4()),
            name=name,
            address_line_1="123 Test Street",
            city="Ottawa",
            postal_code="K1A0A1",
            phone_number="555-0100",
        )
        for name in ("Accessed agency", "Other agency")
    ]
    db_session.add_all(agencies)
    await db_session.flush()

    staff = Admin(
        supabase_user_id=str(users["staff"].id),
        first_name="Test",
        last_name="Staff",
        email=f"staff-{uuid4()}@example.com",
        phone_number="555-0101",
    )
    # Matching a row's internal ID must not grant access without an Auth link.
    unlinked_staff = Admin(
        id=str(users["unlinked_staff"].id),
        supabase_user_id=None,
        first_name="Unlinked",
        last_name="Staff",
        email=f"unlinked-{uuid4()}@example.com",
        phone_number="555-0102",
    )
    agents = {
        role: Agent(
            id=str(users[role].id) if role == "unlinked_agent" else str(uuid4()),
            supabase_user_id=None if role == "unlinked_agent" else str(users[role].id),
            agency_id=agencies[1 if role == "other_agency_admin" else 0].id,
            is_admin=role != "agent",
            first_name="Test",
            last_name=role,
            email=f"{role}@example.com",
            phone_number="555-0103",
        )
        for role in ("agency_admin", "agent", "other_agency_admin", "unlinked_agent")
    }
    db_session.add_all([staff, unlinked_staff, *agents.values()])
    await db_session.flush()
    return SimpleNamespace(
        users=users,
        staff=staff,
        agency_admin=agents["agency_admin"],
        agency_id=agencies[0].id,
        other_agency_id=agencies[1].id,
    )


@pytest.fixture
async def role_client(db_session):
    app = FastAPI()

    @app.get("/staff")
    async def staff_only(admin: Admin = Depends(require_staff)):
        return {"id": admin.id, "supabase_user_id": admin.supabase_user_id}

    @app.get("/agencies/{agency_id}/admin")
    async def agency_admin_only(agent: Agent = Depends(require_agency_admin)):
        return {"id": agent.id, "agency_id": agent.agency_id}

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client, app
    app.dependency_overrides.clear()


async def test_require_staff_allows_linked_admin(role_client, role_data):
    client, app = role_client
    app.dependency_overrides[get_current_user] = lambda: role_data.users["staff"]

    response = await client.get("/staff")

    assert response.status_code == 200
    assert response.json() == {
        "id": role_data.staff.id,
        "supabase_user_id": str(role_data.users["staff"].id),
    }


@pytest.mark.parametrize(
    "role",
    [
        "agency_admin",
        "agent",
        "other_agency_admin",
        "missing",
        "unlinked_staff",
        "unlinked_agent",
    ],
)
async def test_require_staff_denies_users_without_linked_admin(
    role_client, role_data, role
):
    client, app = role_client
    app.dependency_overrides[get_current_user] = lambda: role_data.users[role]

    response = await client.get("/staff")

    assert response.status_code == 403
    assert response.json() == {"detail": "Staff access required"}


async def test_require_agency_admin_allows_admin_of_accessed_agency(
    role_client, role_data
):
    client, app = role_client
    app.dependency_overrides[get_current_user] = lambda: role_data.users["agency_admin"]

    response = await client.get(f"/agencies/{role_data.agency_id}/admin")

    assert response.status_code == 200
    assert response.json() == {
        "id": role_data.agency_admin.id,
        "agency_id": role_data.agency_id,
    }


@pytest.mark.parametrize(
    "role",
    [
        "staff",
        "agent",
        "other_agency_admin",
        "missing",
        "unlinked_staff",
        "unlinked_agent",
    ],
)
async def test_require_agency_admin_denies_missing_role_or_wrong_agency(
    role_client, role_data, role
):
    client, app = role_client
    app.dependency_overrides[get_current_user] = lambda: role_data.users[role]

    response = await client.get(f"/agencies/{role_data.agency_id}/admin")

    assert response.status_code == 403
    assert response.json() == {"detail": "Agency admin access required"}


async def test_agency_query_parameter_cannot_override_accessed_agency(
    role_client, role_data
):
    client, app = role_client
    app.dependency_overrides[get_current_user] = lambda: role_data.users["agency_admin"]

    response = await client.get(
        f"/agencies/{role_data.other_agency_id}/admin",
        params={"agency_id": role_data.agency_id},
    )

    assert response.status_code == 403


@pytest.mark.parametrize("path", ["/staff", "/agencies/any-agency/admin"])
async def test_role_dependencies_require_authentication(role_client, path):
    client, _app = role_client

    response = await client.get(path)

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
