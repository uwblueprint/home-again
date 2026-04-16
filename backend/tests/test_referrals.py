"""Tests for /api/referrals endpoints."""

AGENCY_BASE = {
    "name": "Referral Agency",
    "address_line_1": "1 Referral Blvd",
    "city": "Montreal",
    "postal_code": "H1A1A1",
    "phone_number": "555-7100",
}

CLIENT_BASE = {
    "first_name": "Ivan",
    "last_name": "Client",
    "birthday": "1985-03-20",
    "family_type": "family",
    "num_children": 2,
    "num_adults": 2,
}

REFERRAL_BASE = {
    "requested_items": [{"type": "sofa", "quantity": 1}],
    "address_line_1": "42 Delivery St",
    "city": "Montreal",
    "status": "pending",
}


async def create_agency(client, **overrides):
    payload = {**AGENCY_BASE, **overrides}
    resp = await client.post("/api/agencies", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_client(http_client, **overrides):
    payload = {**CLIENT_BASE, **overrides}
    resp = await http_client.post("/api/clients", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_referral(http_client, client_id, **overrides):
    payload = {**REFERRAL_BASE, "client_id": client_id, **overrides}
    resp = await http_client.post("/api/referrals", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_list_referrals_empty(client):
    resp = await client.get("/api/referrals")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_create_referral_valid(client):
    c = await create_client(client, first_name="ValidRef")
    data = await create_referral(client, c["id"])
    assert data["client_id"] == c["id"]
    assert "id" in data


async def test_requested_items_round_trip(client):
    items = [{"type": "bed", "quantity": 1}, {"type": "dresser", "quantity": 2}]
    c = await create_client(client, first_name="ItemsRound")
    data = await create_referral(client, c["id"], requested_items=items)
    resp = await client.get(f"/api/referrals/{data['id']}")
    assert resp.status_code == 200
    assert resp.json()["requested_items"] == items


async def test_create_referral_invalid_client(client):
    resp = await client.post(
        "/api/referrals",
        json={**REFERRAL_BASE, "client_id": "nonexistent"},
    )
    assert resp.status_code == 400


async def test_program_field_preserved(client):
    c = await create_client(client, first_name="ProgramRef")
    data = await create_referral(client, c["id"], program="Housing Support")
    assert data["program"] == "Housing Support"


async def test_referral_status_enum_invalid(client):
    c = await create_client(client, first_name="BadStatus")
    resp = await client.post(
        "/api/referrals",
        json={**REFERRAL_BASE, "client_id": c["id"], "status": "invalid_status"},
    )
    assert resp.status_code == 422


async def test_list_referrals_newest_first(client):
    c = await create_client(client, first_name="OrderRef")
    r1 = await create_referral(client, c["id"])
    r2 = await create_referral(client, c["id"])
    resp = await client.get("/api/referrals")
    assert resp.status_code == 200
    ids = [r["id"] for r in resp.json()]
    assert ids.index(r2["id"]) < ids.index(r1["id"])


async def test_get_referral(client):
    c = await create_client(client, first_name="GetRef")
    created = await create_referral(client, c["id"])
    resp = await client.get(f"/api/referrals/{created['id']}")
    assert resp.status_code == 200


async def test_get_referral_not_found(client):
    resp = await client.get("/api/referrals/nonexistent-id")
    assert resp.status_code == 404


async def test_update_referral_partial(client):
    c = await create_client(client, first_name="UpdRef")
    created = await create_referral(client, c["id"])
    resp = await client.put(f"/api/referrals/{created['id']}", json={"status": "approved"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"


async def test_update_referral_empty_body(client):
    c = await create_client(client, first_name="EmptyRef")
    created = await create_referral(client, c["id"])
    resp = await client.put(f"/api/referrals/{created['id']}", json={})
    assert resp.status_code == 400


async def test_delete_referral(client):
    c = await create_client(client, first_name="DelRef")
    created = await create_referral(client, c["id"])
    resp = await client.delete(f"/api/referrals/{created['id']}")
    assert resp.status_code == 204
    assert (await client.get(f"/api/referrals/{created['id']}")).status_code == 404
