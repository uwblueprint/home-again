"""Tests for /api/furniture endpoints."""

DONOR_BASE = {
    "first_name": "Helen",
    "last_name": "Donor",
    "email": "helen@example.com",
    "phone": "555-6000",
}

FURNITURE_BASE = {
    "name": "Sofa",
    "image_url": "https://example.com/sofa.jpg",
    "description": "A comfortable sofa",
    "colour": "blue",
    "category": "seating",
    "smoking_household": False,
    "has_pets": False,
    "status": "PICKUP_PENDING",
}


async def create_donor(client, **overrides):
    payload = {**DONOR_BASE, **overrides}
    resp = await client.post("/api/donors", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_donation(client, donor_id):
    resp = await client.post("/api/donations", json={"donor_id": donor_id})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_furniture(client_fixture, **overrides):
    payload = {**FURNITURE_BASE, **overrides}
    resp = await client_fixture.post("/api/furniture", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_furniture_empty(client):
    resp = await client.get("/api/furniture")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_furniture_valid(client):
    data = await create_furniture(client, name="Valid Sofa")
    assert data["name"] == "Valid Sofa"
    assert "id" in data


async def test_create_furniture_missing_image(client):
    payload = {k: v for k, v in FURNITURE_BASE.items() if k != "image_url"}
    resp = await client.post("/api/furniture", json=payload)
    assert resp.status_code == 422


async def test_create_furniture_missing_description(client):
    payload = {k: v for k, v in FURNITURE_BASE.items() if k != "description"}
    resp = await client.post("/api/furniture", json=payload)
    assert resp.status_code == 422


async def test_create_furniture_missing_colour(client):
    payload = {k: v for k, v in FURNITURE_BASE.items() if k != "colour"}
    resp = await client.post("/api/furniture", json=payload)
    assert resp.status_code == 422


async def test_create_furniture_missing_category(client):
    payload = {k: v for k, v in FURNITURE_BASE.items() if k != "category"}
    resp = await client.post("/api/furniture", json=payload)
    assert resp.status_code == 422


async def test_has_pets_defaults_false(client):
    data = await create_furniture(client, name="NoPets Sofa")
    assert data["has_pets"] is False


async def test_furniture_with_valid_donation(client):
    donor = await create_donor(client, email="furn_donor@example.com")
    donation = await create_donation(client, donor["id"])
    data = await create_furniture(client, name="Linked Sofa", donation_id=donation["id"])
    assert data["donation_id"] == donation["id"]


async def test_furniture_invalid_donation_id(client):
    resp = await client.post("/api/furniture", json={**FURNITURE_BASE, "donation_id": "nonexistent"})
    assert resp.status_code == 400


async def test_get_furniture(client):
    created = await create_furniture(client, name="Get Sofa")
    resp = await client.get(f"/api/furniture/{created['id']}")
    assert resp.status_code == 200


async def test_get_furniture_not_found(client):
    resp = await client.get("/api/furniture/nonexistent-id")
    assert resp.status_code == 404


async def test_update_furniture_partial(client):
    created = await create_furniture(client, name="Update Sofa")
    resp = await client.put(f"/api/furniture/{created['id']}", json={"name": "Updated Sofa"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Sofa"


async def test_update_furniture_empty_body(client):
    created = await create_furniture(client, name="Empty Sofa")
    resp = await client.put(f"/api/furniture/{created['id']}", json={})
    assert resp.status_code == 400


async def test_furniture_status_enum_invalid(client):
    resp = await client.post("/api/furniture", json={**FURNITURE_BASE, "status": "INVALID"})
    assert resp.status_code == 422


async def test_delete_furniture(client):
    created = await create_furniture(client, name="Delete Sofa")
    resp = await client.delete(f"/api/furniture/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/furniture/{created['id']}")).status_code == 404
