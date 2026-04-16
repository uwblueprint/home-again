"""Tests for /api/clients endpoints."""

CLIENT_BASE = {
    "first_name": "Dana",
    "last_name": "Client",
    "birthday": "1990-05-15",
    "family_type": "single",
    "num_children": 0,
    "num_adults": 1,
}

AGENCY_BASE = {
    "name": "Clients Test Agency",
    "address_line_1": "789 Client Rd",
    "city": "Vancouver",
    "postal_code": "V5K1A1",
    "phone_number": "555-3100",
}


async def create_client(client_fixture, **overrides):
    payload = {**CLIENT_BASE, **overrides}
    resp = await client_fixture.post("/api/clients", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_clients_empty(client):
    resp = await client.get("/api/clients")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_client_valid(client):
    data = await create_client(client, first_name="Valid")
    assert data["first_name"] == "Valid"
    assert "id" in data


async def test_create_client_missing_birthday(client):
    payload = {k: v for k, v in CLIENT_BASE.items() if k != "birthday"}
    resp = await client.post("/api/clients", json=payload)
    assert resp.status_code == 422


async def test_create_client_invalid_agency_id(client):
    payload = {**CLIENT_BASE, "agency_id": "nonexistent"}
    resp = await client.post("/api/clients", json=payload)
    assert resp.status_code == 400


async def test_speaks_english_defaults_true(client):
    data = await create_client(client, first_name="SpeaksEn")
    assert data["speaks_english"] is True


async def test_language_field_stored(client):
    data = await create_client(
        client,
        first_name="French",
        speaks_english=False,
        language="French",
    )
    assert data["speaks_english"] is False
    assert data["language"] == "French"


async def test_get_client(client):
    created = await create_client(client, first_name="GetClient")
    resp = await client.get(f"/api/clients/{created['id']}")
    assert resp.status_code == 200


async def test_get_client_not_found(client):
    resp = await client.get("/api/clients/nonexistent-id")
    assert resp.status_code == 404


async def test_update_client_partial(client):
    created = await create_client(client, first_name="UpdClient")
    resp = await client.put(f"/api/clients/{created['id']}", json={"first_name": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Updated"


async def test_update_client_empty_body(client):
    created = await create_client(client, first_name="EmptyClient")
    resp = await client.put(f"/api/clients/{created['id']}", json={})
    assert resp.status_code == 400


async def test_delete_client(client):
    created = await create_client(client, first_name="DelClient")
    resp = await client.delete(f"/api/clients/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/clients/{created['id']}")).status_code == 404
