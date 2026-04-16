"""Tests for /api/donations endpoints."""

DONOR_BASE = {
    "first_name": "Grant",
    "last_name": "Donor",
    "email": "grant@example.com",
    "phone": "555-5000",
}

DONATION_BASE = {
    "donation_type": "person",
    "status": "pending",
}


async def create_donor(client, **overrides):
    payload = {**DONOR_BASE, **overrides}
    resp = await client.post("/api/donors", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_donation(client, donor_id, **overrides):
    payload = {**DONATION_BASE, "donor_id": donor_id, **overrides}
    resp = await client.post("/api/donations", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_donations_empty(client):
    resp = await client.get("/api/donations")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_donation_valid(client):
    donor = await create_donor(client, email="donation_donor@example.com")
    data = await create_donation(client, donor["id"])
    assert data["donor_id"] == donor["id"]
    assert "id" in data


async def test_create_donation_invalid_donor(client):
    resp = await client.post(
        "/api/donations",
        json={**DONATION_BASE, "donor_id": "nonexistent"},
    )
    assert resp.status_code == 400


async def test_list_donations_newest_first(client):
    donor = await create_donor(client, email="order_donor@example.com")
    d1 = await create_donation(client, donor["id"])
    d2 = await create_donation(client, donor["id"])
    resp = await client.get("/api/donations")
    assert resp.status_code == 200
    ids = [d["id"] for d in resp.json()]
    assert ids.index(d2["id"]) < ids.index(d1["id"])


async def test_donation_type_enum_invalid(client):
    donor = await create_donor(client, email="enum_donor@example.com")
    resp = await client.post(
        "/api/donations",
        json={"donor_id": donor["id"], "donation_type": "invalid_type"},
    )
    assert resp.status_code == 422


async def test_get_donation(client):
    donor = await create_donor(client, email="getdon_donor@example.com")
    created = await create_donation(client, donor["id"])
    resp = await client.get(f"/api/donations/{created['id']}")
    assert resp.status_code == 200


async def test_get_donation_not_found(client):
    resp = await client.get("/api/donations/nonexistent-id")
    assert resp.status_code == 404


async def test_update_donation(client):
    donor = await create_donor(client, email="upddon_donor@example.com")
    created = await create_donation(client, donor["id"])
    resp = await client.put(
        f"/api/donations/{created['id']}", json={"status": "completed"}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


async def test_update_donation_empty_body(client):
    donor = await create_donor(client, email="emptydonate@example.com")
    created = await create_donation(client, donor["id"])
    resp = await client.put(f"/api/donations/{created['id']}", json={})
    assert resp.status_code == 400


async def test_delete_donation(client):
    donor = await create_donor(client, email="deldonate@example.com")
    created = await create_donation(client, donor["id"])
    resp = await client.delete(f"/api/donations/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/donations/{created['id']}")).status_code == 404
