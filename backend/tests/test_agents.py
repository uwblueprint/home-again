"""Tests for /api/agents endpoints."""

AGENCY_BASE = {
    "name": "Agents Test Agency",
    "address_line_1": "456 Agent Ave",
    "city": "Ottawa",
    "postal_code": "K1A0A1",
    "phone_number": "555-2000",
}


async def create_agency(client, **overrides):
    payload = {**AGENCY_BASE, **overrides}
    resp = await client.post("/api/agencies", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def make_agent_payload(agency_id, email="agent@example.com"):
    return {
        "first_name": "Carol",
        "last_name": "Agent",
        "email": email,
        "phone_number": "555-2001",
        "agency_id": agency_id,
    }


async def test_list_agents_empty(client):
    resp = await client.get("/api/agents")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_agent_valid(client):
    agency = await create_agency(client, name="Agent Valid Agency")
    payload = await make_agent_payload(agency["id"])
    resp = await client.post("/api/agents", json=payload)
    assert resp.status_code == 201
    assert resp.json()["email"] == payload["email"]


async def test_create_agent_invalid_agency(client):
    payload = await make_agent_payload("nonexistent-agency-id", email="bad@example.com")
    resp = await client.post("/api/agents", json=payload)
    assert resp.status_code == 400


async def test_is_admin_defaults_false(client):
    agency = await create_agency(client, name="IsAdmin Agency")
    payload = await make_agent_payload(agency["id"], email="isadmin@example.com")
    resp = await client.post("/api/agents", json=payload)
    assert resp.status_code == 201
    assert resp.json()["is_admin"] is False


async def test_update_is_admin(client):
    agency = await create_agency(client, name="UpdateAdmin Agency")
    payload = await make_agent_payload(agency["id"], email="updadmin@example.com")
    created = (await client.post("/api/agents", json=payload)).json()
    resp = await client.put(f"/api/agents/{created['id']}", json={"is_admin": True})
    assert resp.status_code == 200
    assert resp.json()["is_admin"] is True


async def test_create_agent_missing_email(client):
    agency = await create_agency(client, name="NoEmail Agency")
    payload = {
        "first_name": "No",
        "last_name": "Email",
        "phone_number": "555-0000",
        "agency_id": agency["id"],
    }
    resp = await client.post("/api/agents", json=payload)
    assert resp.status_code == 422


async def test_get_agent(client):
    agency = await create_agency(client, name="GetAgent Agency")
    payload = await make_agent_payload(agency["id"], email="getagent@example.com")
    created = (await client.post("/api/agents", json=payload)).json()
    resp = await client.get(f"/api/agents/{created['id']}")
    assert resp.status_code == 200


async def test_get_agent_not_found(client):
    resp = await client.get("/api/agents/nonexistent-id")
    assert resp.status_code == 404


async def test_update_agent_partial(client):
    agency = await create_agency(client, name="PartialUpdate Agency")
    payload = await make_agent_payload(agency["id"], email="partial@example.com")
    created = (await client.post("/api/agents", json=payload)).json()
    resp = await client.put(
        f"/api/agents/{created['id']}", json={"first_name": "Updated"}
    )
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Updated"


async def test_delete_agent(client):
    agency = await create_agency(client, name="DeleteAgent Agency")
    payload = await make_agent_payload(agency["id"], email="delagent@example.com")
    created = (await client.post("/api/agents", json=payload)).json()
    resp = await client.delete(f"/api/agents/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/agents/{created['id']}")).status_code == 404


async def test_create_agent_duplicate_email_any_case(client):
    agency = await create_agency(client, name="Duplicate Email Agency")
    payload = await make_agent_payload(agency["id"], email="Dup.Agent@example.com")
    resp = await client.post("/api/agents", json=payload)
    assert resp.status_code == 201, resp.text
    # Stored as entered.
    assert resp.json()["email"] == "Dup.Agent@example.com"

    for email in ("Dup.Agent@example.com", " dup.agent@EXAMPLE.com "):
        payload = await make_agent_payload(agency["id"], email=email)
        resp = await client.post("/api/agents", json=payload)
        assert resp.status_code == 409, email
        assert resp.json()["detail"] == "An agent with this email already exists."


async def test_create_agent_blank_email(client):
    agency = await create_agency(client, name="Blank Email Agency")
    payload = await make_agent_payload(agency["id"], email="  ")
    resp = await client.post("/api/agents", json=payload)
    assert resp.status_code == 422


async def test_update_agent_to_taken_email(client):
    agency = await create_agency(client, name="Taken Email Agency")
    first = await client.post(
        "/api/agents",
        json=await make_agent_payload(agency["id"], email="owner.agent@example.com"),
    )
    second = await client.post(
        "/api/agents",
        json=await make_agent_payload(agency["id"], email="mover.agent@example.com"),
    )
    assert first.status_code == second.status_code == 201
    resp = await client.put(
        f"/api/agents/{second.json()['id']}", json={"email": "OWNER.agent@example.com"}
    )
    assert resp.status_code == 409


async def test_update_agent_changes_case_of_own_email(client):
    agency = await create_agency(client, name="Own Email Agency")
    created = await client.post(
        "/api/agents",
        json=await make_agent_payload(agency["id"], email="self.agent@example.com"),
    )
    assert created.status_code == 201
    resp = await client.put(
        f"/api/agents/{created.json()['id']}", json={"email": "Self.Agent@example.com"}
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["email"] == "Self.Agent@example.com"


async def test_update_agent_null_email_is_422(client):
    agency = await create_agency(client, name="Null Email Agency")
    created = await client.post(
        "/api/agents",
        json=await make_agent_payload(agency["id"], email="null.agent@example.com"),
    )
    assert created.status_code == 201
    resp = await client.put(f"/api/agents/{created.json()['id']}", json={"email": None})
    assert resp.status_code == 422


async def test_update_agent_other_error_after_rollback_is_400(client):
    """The IntegrityError path reads the id it saved, not the expired agent."""
    agency = await create_agency(client, name="Rollback Agency")
    created = await client.post(
        "/api/agents",
        json=await make_agent_payload(agency["id"], email="rollback.agent@example.com"),
    )
    assert created.status_code == 201
    resp = await client.put(
        f"/api/agents/{created.json()['id']}",
        json={"email": "Rollback.Agent@example.com", "first_name": None},
    )
    assert resp.status_code == 400, resp.text
