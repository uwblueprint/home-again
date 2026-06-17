"""Tests for /api/donors endpoints."""

DONOR_BASE = {
    "first_name": "Frank",
    "last_name": "Donor",
    "email": "frank@example.com",
    "phone": "555-4000",
}


async def create_donor(client, **overrides):
    payload = {**DONOR_BASE, **overrides}
    resp = await client.post("/api/donors", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_donors_empty(client):
    resp = await client.get("/api/donors")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_donor_valid(client):
    data = await create_donor(client, email="valid_donor@example.com")
    assert data["email"] == "valid_donor@example.com"
    assert "id" in data


async def test_create_donor_missing_first_name(client):
    payload = {k: v for k, v in DONOR_BASE.items() if k != "first_name"}
    payload["email"] = "nofname@example.com"
    resp = await client.post("/api/donors", json=payload)
    assert resp.status_code == 422


async def test_create_donor_missing_email(client):
    payload = {k: v for k, v in DONOR_BASE.items() if k != "email"}
    resp = await client.post("/api/donors", json=payload)
    assert resp.status_code == 422


async def test_get_donor(client):
    created = await create_donor(client, email="getdonor@example.com")
    resp = await client.get(f"/api/donors/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_get_donor_not_found(client):
    resp = await client.get("/api/donors/nonexistent-id")
    assert resp.status_code == 404


async def test_update_donor_partial(client):
    created = await create_donor(client, email="upddonor@example.com")
    resp = await client.put(
        f"/api/donors/{created['id']}", json={"first_name": "Updated"}
    )
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Updated"


async def test_update_donor_empty_body(client):
    created = await create_donor(client, email="emptydonor@example.com")
    resp = await client.put(f"/api/donors/{created['id']}", json={})
    assert resp.status_code == 400


async def test_delete_donor(client):
    created = await create_donor(client, email="deldonor@example.com")
    resp = await client.delete(f"/api/donors/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/donors/{created['id']}")).status_code == 404


async def test_delete_donor_not_found(client):
    resp = await client.delete("/api/donors/nonexistent-id")
    assert resp.status_code == 404
