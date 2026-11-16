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


async def create_donation(client, donor_id, **overrides):
    payload = {"donor_id": donor_id, "status": "pending", **overrides}
    resp = await client.post("/api/donations", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def list_donors(client):
    resp = await client.get("/api/donors")
    assert resp.status_code == 200, resp.text
    return resp.json()


def find_in_list(donors, donor_id):
    matches = [d for d in donors if d["id"] == donor_id]
    assert len(matches) == 1, f"expected donor {donor_id} exactly once"
    return matches[0]


async def test_list_donors_without_donations(client):
    donor = await create_donor(client, email="count_zero@example.com")
    listed = find_in_list(await list_donors(client), donor["id"])
    assert listed["donation_count"] == 0
    assert listed["last_donated_at"] is None


async def test_list_donors_counts_each_donors_donations(client):
    busy = await create_donor(client, email="count_busy@example.com")
    other = await create_donor(client, email="count_other@example.com")
    for status in ("pending", "completed", "cancelled"):
        await create_donation(client, busy["id"], status=status)
    await create_donation(client, other["id"])

    donors = await list_donors(client)
    # Every donation counts regardless of status, and each donor appears once
    # (the join doesn't duplicate donors with several donations).
    assert find_in_list(donors, busy["id"])["donation_count"] == 3
    assert find_in_list(donors, other["id"])["donation_count"] == 1


async def test_list_donors_last_donated_at_is_latest_donation(client):
    donor = await create_donor(client, email="last_several@example.com")
    other = await create_donor(client, email="last_other@example.com")
    await create_donation(client, donor["id"])
    latest = await create_donation(client, donor["id"], status="cancelled")
    other_latest = await create_donation(client, other["id"])

    donors = await list_donors(client)
    # Every donation counts as activity regardless of status, and another
    # donor's later donation doesn't leak in.
    assert find_in_list(donors, donor["id"])["last_donated_at"] == latest["created_at"]
    assert (
        find_in_list(donors, other["id"])["last_donated_at"]
        == other_latest["created_at"]
    )


async def test_list_donors_keeps_donor_fields(client):
    donor = await create_donor(
        client, email="count_fields@example.com", first_name="Fiona"
    )
    listed = find_in_list(await list_donors(client), donor["id"])
    assert {k: listed[k] for k in donor} == donor


async def test_donor_detail_has_no_list_fields(client):
    donor = await create_donor(client, email="count_detail@example.com")
    detail = (await client.get(f"/api/donors/{donor['id']}")).json()
    for body in (donor, detail):
        assert "donation_count" not in body
        assert "last_donated_at" not in body


FURNITURE_BASE = {
    "name": "Sofa",
    "image_url": "https://example.com/sofa.jpg",
    "description": "No stains",
    "colour": "brown",
    "category": "living room",
    "smoking_household": False,
    "has_pets": False,
    "status": "PICKUP_PENDING",
}


async def test_list_donor_donations_newest_first_with_items(client):
    donor = await create_donor(client, email="history_donor@example.com")
    other = await create_donor(client, email="history_other@example.com")
    first = await create_donation(client, donor["id"])
    second = await create_donation(client, donor["id"])
    await create_donation(client, other["id"])
    resp = await client.post(
        "/api/furniture", json={**FURNITURE_BASE, "donation_id": first["id"]}
    )
    assert resp.status_code == 201, resp.text

    resp = await client.get(f"/api/donors/{donor['id']}/donations")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert [d["id"] for d in data] == [second["id"], first["id"]]
    assert [item["name"] for item in data[1]["furniture_items"]] == ["Sofa"]
    assert data[1]["review_status"] == "pending_review"
    assert data[1]["donor"]["id"] == donor["id"]


async def test_list_donor_donations_empty(client):
    donor = await create_donor(client, email="no_donations@example.com")
    resp = await client.get(f"/api/donors/{donor['id']}/donations")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_donor_donations_unknown_donor(client):
    resp = await client.get("/api/donors/nonexistent/donations")
    assert resp.status_code == 404
