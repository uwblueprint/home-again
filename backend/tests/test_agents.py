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
    resp = await client.put(f"/api/agents/{created['id']}", json={"first_name": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Updated"


async def test_delete_agent(client):
    agency = await create_agency(client, name="DeleteAgent Agency")
    payload = await make_agent_payload(agency["id"], email="delagent@example.com")
    created = (await client.post("/api/agents", json=payload)).json()
    resp = await client.delete(f"/api/agents/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/agents/{created['id']}")).status_code == 404
