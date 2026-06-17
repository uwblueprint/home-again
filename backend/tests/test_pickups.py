"""Tests for /api/pickups endpoints.

A pickup is a route stop where furniture is collected from a donor.
It links a route to an optional donation.
"""

ROUTE_BASE = {"date": "2026-06-01T08:00:00", "status": "pending"}

DONOR_BASE = {
    "first_name": "Pat",
    "last_name": "Donor",
    "email": "pat@example.com",
    "phone": "555-0101",
}

DONATION_BASE = {
    "donation_type": "person",
    "status": "pending",
}


async def create_route(client, **overrides):
    resp = await client.post("/api/routes", json={**ROUTE_BASE, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_donor(client, **overrides):
    resp = await client.post("/api/donors", json={**DONOR_BASE, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_donation(client, donor_id, **overrides):
    resp = await client.post(
        "/api/donations", json={"donor_id": donor_id, **DONATION_BASE, **overrides}
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_pickup(client, route_id, **overrides):
    resp = await client.post("/api/pickups", json={"route_id": route_id, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_pickups_empty(client):
    resp = await client.get("/api/pickups")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_pickup_valid(client):
    route = await create_route(client)
    data = await create_pickup(client, route["id"])
    assert data["route_id"] == route["id"]
    assert data["donation_id"] is None
    assert "id" in data


async def test_create_pickup_with_donation(client):
    route = await create_route(client)
    donor = await create_donor(client, email="pickup_donor@example.com")
    donation = await create_donation(client, donor["id"])
    data = await create_pickup(client, route["id"], donation_id=donation["id"])
    assert data["route_id"] == route["id"]
    assert data["donation_id"] == donation["id"]


async def test_create_pickup_invalid_route_id(client):
    resp = await client.post("/api/pickups", json={"route_id": "nonexistent"})
    assert resp.status_code == 400


async def test_create_pickup_invalid_donation_id(client):
    route = await create_route(client)
    resp = await client.post(
        "/api/pickups",
        json={"route_id": route["id"], "donation_id": "nonexistent"},
    )
    assert resp.status_code == 400


async def test_get_pickup(client):
    route = await create_route(client)
    created = await create_pickup(client, route["id"])
    resp = await client.get(f"/api/pickups/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_get_pickup_not_found(client):
    resp = await client.get("/api/pickups/nonexistent-id")
    assert resp.status_code == 404


async def test_update_pickup_route(client):
    route1 = await create_route(client)
    route2 = await create_route(client)
    created = await create_pickup(client, route1["id"])
    resp = await client.put(
        f"/api/pickups/{created['id']}", json={"route_id": route2["id"]}
    )
    assert resp.status_code == 200
    assert resp.json()["route_id"] == route2["id"]


async def test_update_pickup_empty_body(client):
    route = await create_route(client)
    created = await create_pickup(client, route["id"])
    resp = await client.put(f"/api/pickups/{created['id']}", json={})
    assert resp.status_code == 400


async def test_update_pickup_not_found(client):
    resp = await client.put("/api/pickups/nonexistent-id", json={"route_id": "x"})
    assert resp.status_code == 404


async def test_delete_pickup(client):
    route = await create_route(client)
    created = await create_pickup(client, route["id"])
    resp = await client.delete(f"/api/pickups/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/pickups/{created['id']}")).status_code == 404


async def test_delete_pickup_not_found(client):
    resp = await client.delete("/api/pickups/nonexistent-id")
    assert resp.status_code == 404


async def test_furniture_linked_via_pickup_id(client):
    """Furniture items can reference a pickup stop via pickup_id."""
    route = await create_route(client)
    pickup = await create_pickup(client, route["id"])
    furn_payload = {
        "name": "Pickup Sofa",
        "image_url": "https://example.com/sofa.jpg",
        "description": "Sofa collected at pickup",
        "colour": "grey",
        "category": "seating",
        "smoking_household": False,
        "has_pets": False,
        "status": "PICKUP_PENDING",
        "pickup_id": pickup["id"],
    }
    furn_resp = await client.post("/api/furniture", json=furn_payload)
    assert furn_resp.status_code == 201
    assert furn_resp.json()["pickup_id"] == pickup["id"]
