"""Tests for /api/admins endpoints."""

import pytest


ADMIN_BASE = {"first_name": "Alice", "last_name": "Smith", "email": "alice@example.com", "phone_number": "555-0001"}


async def create_admin(client, **overrides):
    payload = {**ADMIN_BASE, **overrides}
    resp = await client.post("/api/admins", json=payload)
    assert resp.status_code == 201
    return resp.json()


async def test_list_admins_empty(client):
    resp = await client.get("/api/admins")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_admin_valid(client):
    data = await create_admin(client)
    assert data["email"] == ADMIN_BASE["email"]
    assert "id" in data


async def test_create_admin_missing_email(client):
    payload = {k: v for k, v in ADMIN_BASE.items() if k != "email"}
    resp = await client.post("/api/admins", json=payload)
    assert resp.status_code == 422


async def test_create_admin_missing_phone(client):
    payload = {k: v for k, v in ADMIN_BASE.items() if k != "phone_number"}
    resp = await client.post("/api/admins", json=payload)
    assert resp.status_code == 422


async def test_get_admin(client):
    created = await create_admin(client, email="get_admin@example.com")
    resp = await client.get(f"/api/admins/{created['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_get_admin_not_found(client):
    resp = await client.get("/api/admins/nonexistent-id")
    assert resp.status_code == 404


async def test_update_admin_partial(client):
    created = await create_admin(client, email="upd_admin@example.com")
    resp = await client.put(f"/api/admins/{created['id']}", json={"first_name": "Bob"})
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Bob"


async def test_update_admin_empty_body(client):
    created = await create_admin(client, email="empty_upd@example.com")
    resp = await client.put(f"/api/admins/{created['id']}", json={})
    assert resp.status_code == 400


async def test_update_admin_not_found(client):
    resp = await client.put("/api/admins/nonexistent-id", json={"first_name": "X"})
    assert resp.status_code == 404


async def test_delete_admin(client):
    created = await create_admin(client, email="del_admin@example.com")
    resp = await client.delete(f"/api/admins/{created['id']}")
    assert resp.status_code == 204
    resp2 = await client.get(f"/api/admins/{created['id']}")
    assert resp2.status_code == 404


async def test_delete_admin_not_found(client):
    resp = await client.delete("/api/admins/nonexistent-id")
    assert resp.status_code == 404
