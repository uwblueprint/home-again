"""Tests for /api/routes endpoints."""

ROUTE_BASE = {
    "date": "2026-05-01T08:00:00",
    "status": "pending",
}


async def create_route(client, **overrides):
    payload = {**ROUTE_BASE, **overrides}
    resp = await client.post("/api/routes", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_routes_empty(client):
    resp = await client.get("/api/routes")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_route_valid(client):
    data = await create_route(client)
    assert "id" in data
    assert data["status"] == "pending"


async def test_route_has_no_furniture_id_fields(client):
    data = await create_route(client)
    assert "pickup_furniture_ids" not in data
    assert "dropoff_furniture_ids" not in data


async def test_route_status_enum_invalid(client):
    resp = await client.post("/api/routes", json={**ROUTE_BASE, "status": "invalid_status"})
    assert resp.status_code == 422


async def test_get_route(client):
    created = await create_route(client)
    resp = await client.get(f"/api/routes/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_get_route_not_found(client):
    resp = await client.get("/api/routes/nonexistent-id")
    assert resp.status_code == 404


async def test_update_route_partial(client):
    created = await create_route(client)
    resp = await client.put(f"/api/routes/{created['id']}", json={"status": "in_progress"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "in_progress"


async def test_update_route_empty_body(client):
    created = await create_route(client)
    resp = await client.put(f"/api/routes/{created['id']}", json={})
    assert resp.status_code == 400


async def test_delete_route(client):
    created = await create_route(client)
    resp = await client.delete(f"/api/routes/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/routes/{created['id']}")).status_code == 404


async def test_delete_route_not_found(client):
    resp = await client.delete("/api/routes/nonexistent-id")
    assert resp.status_code == 404
