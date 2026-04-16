"""Tests for /api/agencies endpoints."""

AGENCY_BASE = {
    "name": "Test Agency",
    "address_line_1": "123 Main St",
    "city": "Toronto",
    "postal_code": "M1A1A1",
    "phone_number": "555-1000",
}


async def create_agency(client, **overrides):
    payload = {**AGENCY_BASE, **overrides}
    resp = await client.post("/api/agencies", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_agencies_empty(client):
    resp = await client.get("/api/agencies")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_agency_valid(client):
    data = await create_agency(client, name="Valid Agency")
    assert data["name"] == "Valid Agency"
    assert "id" in data


async def test_create_agency_no_main_agent_id(client):
    data = await create_agency(client, name="No Main Agent Agency")
    assert "main_agent_id" not in data


async def test_agency_has_program_field(client):
    data = await create_agency(
        client, name="Program Agency", program="Housing Assistance"
    )
    assert data["program"] == "Housing Assistance"


async def test_get_agency(client):
    created = await create_agency(client, name="Get Agency")
    resp = await client.get(f"/api/agencies/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_get_agency_not_found(client):
    resp = await client.get("/api/agencies/nonexistent-id")
    assert resp.status_code == 404


async def test_update_agency(client):
    created = await create_agency(client, name="Update Agency")
    resp = await client.put(
        f"/api/agencies/{created['id']}", json={"name": "Updated Agency"}
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Agency"


async def test_update_agency_empty_body(client):
    created = await create_agency(client, name="Empty Update Agency")
    resp = await client.put(f"/api/agencies/{created['id']}", json={})
    assert resp.status_code == 400


async def test_delete_agency(client):
    created = await create_agency(client, name="Delete Agency")
    resp = await client.delete(f"/api/agencies/{created['id']}")
    assert resp.status_code == 204
    resp2 = await client.get(f"/api/agencies/{created['id']}")
    assert resp2.status_code == 404
