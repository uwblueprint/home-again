"""Tests for /api/dropoffs endpoints.

A dropoff is a route stop where furniture is delivered to a client.
It links a route to a specific furniture item and optionally a referral.
"""

import datetime

ROUTE_BASE = {"date": "2026-06-15T09:00:00", "status": "pending"}

FURNITURE_BASE = {
    "name": "Dropoff Table",
    "image_url": "https://example.com/table.jpg",
    "description": "A table for dropoff",
    "colour": "oak",
    "category": "tables",
    "smoking_household": False,
    "has_pets": False,
    "status": "SCHEDULED",
}

AGENCY_BASE = {
    "name": "Dropoff Agency",
    "address_line_1": "10 Agency St",
    "city": "Ottawa",
    "postal_code": "K1A0A1",
    "phone_number": "555-0200",
}

CLIENT_BASE = {
    "first_name": "Bob",
    "last_name": "Client",
    "birthday": "1985-03-15",
    "family_type": "single",
    "num_children": 0,
    "num_adults": 1,
}

REFERRAL_BASE = {
    "address_line_1": "5 Client Ave",
    "city": "Ottawa",
    "status": "approved",
    "requested_items": [],
}


async def create_route(client, **overrides):
    resp = await client.post("/api/routes", json={**ROUTE_BASE, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_furniture(client, **overrides):
    resp = await client.post("/api/furniture", json={**FURNITURE_BASE, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_agency(client, **overrides):
    resp = await client.post("/api/agencies", json={**AGENCY_BASE, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_client(client, agency_id=None, **overrides):
    payload = {**CLIENT_BASE, **overrides}
    if agency_id:
        payload["agency_id"] = agency_id
    resp = await client.post("/api/clients", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_referral(client, client_id, **overrides):
    payload = {**REFERRAL_BASE, "client_id": client_id, **overrides}
    resp = await client.post("/api/referrals", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_dropoff(client, route_id, furniture_id, **overrides):
    payload = {"route_id": route_id, "furniture_id": furniture_id, **overrides}
    resp = await client.post("/api/dropoffs", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_dropoffs_empty(client):
    resp = await client.get("/api/dropoffs")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_dropoff_valid(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="Dropoff Table 1")
    data = await create_dropoff(client, route["id"], furniture["id"])
    assert data["route_id"] == route["id"]
    assert data["furniture_id"] == furniture["id"]
    assert "id" in data


async def test_defaults(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="Defaults Table")
    data = await create_dropoff(client, route["id"], furniture["id"])
    assert data["high_priority"] is False
    assert data["contact_in_case_of_cancellation"] is False
    assert data["dispatch_required"] is False


async def test_create_dropoff_with_referral(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="Referral Table")
    cl = await create_client(client, first_name="Ref", last_name="Client")
    referral = await create_referral(client, cl["id"])
    data = await create_dropoff(
        client, route["id"], furniture["id"], referral_id=referral["id"]
    )
    assert data["referral_id"] == referral["id"]


async def test_create_dropoff_invalid_route_id(client):
    furniture = await create_furniture(client, name="BadRoute Table")
    resp = await client.post(
        "/api/dropoffs",
        json={"route_id": "nonexistent", "furniture_id": furniture["id"]},
    )
    assert resp.status_code == 400


async def test_create_dropoff_invalid_furniture_id(client):
    route = await create_route(client)
    resp = await client.post(
        "/api/dropoffs",
        json={"route_id": route["id"], "furniture_id": "nonexistent"},
    )
    assert resp.status_code == 400


async def test_create_dropoff_invalid_referral_id(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="BadRef Table")
    resp = await client.post(
        "/api/dropoffs",
        json={
            "route_id": route["id"],
            "furniture_id": furniture["id"],
            "referral_id": "nonexistent",
        },
    )
    assert resp.status_code == 400


async def test_get_dropoff(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="Get Table")
    created = await create_dropoff(client, route["id"], furniture["id"])
    resp = await client.get(f"/api/dropoffs/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_get_dropoff_not_found(client):
    resp = await client.get("/api/dropoffs/nonexistent-id")
    assert resp.status_code == 404


async def test_update_dropoff(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="Update Table")
    created = await create_dropoff(client, route["id"], furniture["id"])
    resp = await client.put(
        f"/api/dropoffs/{created['id']}", json={"high_priority": True}
    )
    assert resp.status_code == 200
    assert resp.json()["high_priority"] is True


async def test_update_dropoff_empty_body(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="Empty Table")
    created = await create_dropoff(client, route["id"], furniture["id"])
    resp = await client.put(f"/api/dropoffs/{created['id']}", json={})
    assert resp.status_code == 400


async def test_update_dropoff_not_found(client):
    resp = await client.put(
        "/api/dropoffs/nonexistent-id", json={"high_priority": True}
    )
    assert resp.status_code == 404


async def test_delete_dropoff(client):
    route = await create_route(client)
    furniture = await create_furniture(client, name="Delete Table")
    created = await create_dropoff(client, route["id"], furniture["id"])
    resp = await client.delete(f"/api/dropoffs/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/dropoffs/{created['id']}")).status_code == 404


async def test_delete_dropoff_not_found(client):
    resp = await client.delete("/api/dropoffs/nonexistent-id")
    assert resp.status_code == 404
