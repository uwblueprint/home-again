"""Tests for the admin donation-request review flow.

Covers item approve/reject, item photos, the donation detail composite with its
derived review_status, and pickup scheduling/confirmation. These span the
furniture, donations and pickups routers, so they live together rather than
being split across three files.
"""

DONOR_BASE = {
    "first_name": "Katie",
    "last_name": "Sun",
    "email": "katie@example.com",
    "phone": "555-7000",
}

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


async def create_donor(client, **overrides):
    resp = await client.post("/api/donors", json={**DONOR_BASE, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_donation(client, **overrides):
    donor = await create_donor(client, email=f"{overrides.pop('tag', 'd')}@ex.com")
    resp = await client.post(
        "/api/donations", json={"donor_id": donor["id"], **overrides}
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_item(client, donation_id, **overrides):
    payload = {**FURNITURE_BASE, "donation_id": donation_id, **overrides}
    resp = await client.post("/api/furniture", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


# ── Item review ───────────────────────────────────────────────────────────────


async def test_approve_item_sets_status_and_reviewed_at(client):
    donation = await create_donation(client, tag="approve")
    item = await create_item(client, donation["id"])

    resp = await client.post(f"/api/furniture/{item['id']}/approve")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "APPROVED"
    assert data["reviewed_at"] is not None
    assert data["rejection_reason"] is None


async def test_reject_item_records_reason(client):
    donation = await create_donation(client, tag="reject")
    item = await create_item(client, donation["id"])

    resp = await client.post(
        f"/api/furniture/{item['id']}/reject", json={"rejection_reason": "condition"}
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "REJECTED"
    assert data["rejection_reason"] == "condition"
    assert data["reviewed_at"] is not None


async def test_reject_requires_a_reason(client):
    donation = await create_donation(client, tag="noreason")
    item = await create_item(client, donation["id"])

    resp = await client.post(f"/api/furniture/{item['id']}/reject", json={})
    assert resp.status_code == 422


async def test_reject_other_requires_details(client):
    donation = await create_donation(client, tag="other")
    item = await create_item(client, donation["id"])

    resp = await client.post(
        f"/api/furniture/{item['id']}/reject", json={"rejection_reason": "other"}
    )
    assert resp.status_code == 400
    assert "rejection_details" in resp.json()["detail"]


async def test_reject_other_with_blank_details_rejected(client):
    donation = await create_donation(client, tag="blank")
    item = await create_item(client, donation["id"])

    resp = await client.post(
        f"/api/furniture/{item['id']}/reject",
        json={"rejection_reason": "other", "rejection_details": "   "},
    )
    assert resp.status_code == 400


async def test_reject_other_with_details_succeeds(client):
    donation = await create_donation(client, tag="details")
    item = await create_item(client, donation["id"])

    resp = await client.post(
        f"/api/furniture/{item['id']}/reject",
        json={"rejection_reason": "other", "rejection_details": "Too large for van"},
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["rejection_details"] == "Too large for van"


async def test_approving_a_rejected_item_clears_rejection(client):
    donation = await create_donation(client, tag="reapprove")
    item = await create_item(client, donation["id"])

    await client.post(
        f"/api/furniture/{item['id']}/reject", json={"rejection_reason": "pickup"}
    )
    resp = await client.post(f"/api/furniture/{item['id']}/approve")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "APPROVED"
    assert data["rejection_reason"] is None
    assert data["rejection_details"] is None


async def test_put_rejected_without_reason_is_invalid(client):
    donation = await create_donation(client, tag="putreject")
    item = await create_item(client, donation["id"])

    resp = await client.put(f"/api/furniture/{item['id']}", json={"status": "REJECTED"})
    assert resp.status_code == 400
    assert "rejection_reason" in resp.json()["detail"]


async def test_put_rejection_reason_on_non_rejected_item_is_invalid(client):
    donation = await create_donation(client, tag="stray")
    item = await create_item(client, donation["id"])

    resp = await client.put(
        f"/api/furniture/{item['id']}", json={"rejection_reason": "condition"}
    )
    assert resp.status_code == 400


# ── Item photos ───────────────────────────────────────────────────────────────


async def test_replace_photos_sets_order_from_list_position(client):
    donation = await create_donation(client, tag="photos")
    item = await create_item(client, donation["id"])

    resp = await client.put(
        f"/api/furniture/{item['id']}/photos",
        json=[
            {"url": "https://example.com/a.jpg"},
            {"url": "https://example.com/b.jpg"},
            {"url": "https://example.com/c.jpg"},
        ],
    )
    assert resp.status_code == 200, resp.text
    assert [p["position"] for p in resp.json()] == [0, 1, 2]

    detail = await client.get(f"/api/furniture/{item['id']}/detail")
    assert [p["url"] for p in detail.json()["photos"]] == [
        "https://example.com/a.jpg",
        "https://example.com/b.jpg",
        "https://example.com/c.jpg",
    ]


async def test_replace_photos_discards_the_previous_set(client):
    donation = await create_donation(client, tag="rephotos")
    item = await create_item(client, donation["id"])

    await client.put(
        f"/api/furniture/{item['id']}/photos",
        json=[{"url": "https://example.com/old.jpg"}],
    )
    await client.put(
        f"/api/furniture/{item['id']}/photos",
        json=[{"url": "https://example.com/new.jpg"}],
    )

    detail = await client.get(f"/api/furniture/{item['id']}/detail")
    assert [p["url"] for p in detail.json()["photos"]] == [
        "https://example.com/new.jpg"
    ]


# ── Donation detail + derived review status ───────────────────────────────────


async def test_detail_pending_review_when_no_item_reviewed(client):
    donation = await create_donation(client, tag="pending")
    await create_item(client, donation["id"])
    await create_item(client, donation["id"], name="Table")

    resp = await client.get(f"/api/donations/{donation['id']}/detail")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["review_status"] == "pending_review"
    assert len(data["furniture_items"]) == 2
    assert data["donor"]["first_name"] == "Katie"
    assert data["pickup"] is None


async def test_detail_partially_reviewed_when_some_items_reviewed(client):
    donation = await create_donation(client, tag="partial")
    first = await create_item(client, donation["id"])
    await create_item(client, donation["id"], name="Table")

    await client.post(f"/api/furniture/{first['id']}/approve")

    resp = await client.get(f"/api/donations/{donation['id']}/detail")
    assert resp.json()["review_status"] == "partially_reviewed"


async def test_detail_reviewed_when_all_items_reviewed(client):
    donation = await create_donation(client, tag="reviewed")
    first = await create_item(client, donation["id"])
    second = await create_item(client, donation["id"], name="Table")

    await client.post(f"/api/furniture/{first['id']}/approve")
    await client.post(
        f"/api/furniture/{second['id']}/reject", json={"rejection_reason": "condition"}
    )

    resp = await client.get(f"/api/donations/{donation['id']}/detail")
    assert resp.json()["review_status"] == "reviewed"


async def test_detail_pending_review_when_donation_has_no_items(client):
    donation = await create_donation(client, tag="empty")

    resp = await client.get(f"/api/donations/{donation['id']}/detail")
    assert resp.json()["review_status"] == "pending_review"


async def test_detail_scheduled_once_a_pickup_has_a_date(client):
    donation = await create_donation(client, tag="scheduled")
    item = await create_item(client, donation["id"])
    await client.post(f"/api/furniture/{item['id']}/approve")

    await client.post(
        "/api/pickups",
        json={
            "donation_id": donation["id"],
            "scheduled_date": "2026-03-26T00:00:00",
        },
    )

    resp = await client.get(f"/api/donations/{donation['id']}/detail")
    data = resp.json()
    assert data["review_status"] == "scheduled"
    assert data["pickup"]["scheduled_date"].startswith("2026-03-26")


async def test_detail_includes_item_photos(client):
    donation = await create_donation(client, tag="detailphotos")
    item = await create_item(client, donation["id"])
    await client.put(
        f"/api/furniture/{item['id']}/photos",
        json=[{"url": "https://example.com/1.jpg"}],
    )

    resp = await client.get(f"/api/donations/{donation['id']}/detail")
    assert resp.json()["furniture_items"][0]["photos"][0]["position"] == 0


async def test_detail_404_for_unknown_donation(client):
    resp = await client.get("/api/donations/does-not-exist/detail")
    assert resp.status_code == 404


# ── Pickup scheduling and confirmation ────────────────────────────────────────


async def test_pickup_can_be_created_without_a_route(client):
    donation = await create_donation(client, tag="noroute")

    resp = await client.post(
        "/api/pickups",
        json={"donation_id": donation["id"], "scheduled_date": "2026-03-26T00:00:00"},
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["route_id"] is None
    assert data["confirmed_at"] is None


async def test_confirm_sets_confirmed_at(client):
    donation = await create_donation(client, tag="confirm")
    pickup = (
        await client.post(
            "/api/pickups",
            json={
                "donation_id": donation["id"],
                "scheduled_date": "2026-03-26T00:00:00",
            },
        )
    ).json()

    resp = await client.post(f"/api/pickups/{pickup['id']}/confirm")
    assert resp.status_code == 200, resp.text
    assert resp.json()["confirmed_at"] is not None


async def test_confirm_is_idempotent(client):
    donation = await create_donation(client, tag="idem")
    pickup = (
        await client.post(
            "/api/pickups",
            json={
                "donation_id": donation["id"],
                "scheduled_date": "2026-03-26T00:00:00",
            },
        )
    ).json()

    first = (await client.post(f"/api/pickups/{pickup['id']}/confirm")).json()
    second = (await client.post(f"/api/pickups/{pickup['id']}/confirm")).json()
    assert first["confirmed_at"] == second["confirmed_at"]


async def test_confirm_requires_a_scheduled_date(client):
    donation = await create_donation(client, tag="nodate")
    pickup = (
        await client.post("/api/pickups", json={"donation_id": donation["id"]})
    ).json()

    resp = await client.post(f"/api/pickups/{pickup['id']}/confirm")
    assert resp.status_code == 400
    assert "scheduled date" in resp.json()["detail"]


async def test_changing_the_date_clears_confirmation(client):
    donation = await create_donation(client, tag="rechange")
    pickup = (
        await client.post(
            "/api/pickups",
            json={
                "donation_id": donation["id"],
                "scheduled_date": "2026-03-26T00:00:00",
            },
        )
    ).json()
    await client.post(f"/api/pickups/{pickup['id']}/confirm")

    resp = await client.put(
        f"/api/pickups/{pickup['id']}", json={"scheduled_date": "2026-04-02T00:00:00"}
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["confirmed_at"] is None


async def test_editing_only_the_note_keeps_confirmation(client):
    donation = await create_donation(client, tag="keepconfirm")
    pickup = (
        await client.post(
            "/api/pickups",
            json={
                "donation_id": donation["id"],
                "scheduled_date": "2026-03-26T00:00:00",
            },
        )
    ).json()
    confirmed = (await client.post(f"/api/pickups/{pickup['id']}/confirm")).json()

    resp = await client.put(
        f"/api/pickups/{pickup['id']}", json={"note": "Afternoon after work hours"}
    )
    assert resp.json()["confirmed_at"] == confirmed["confirmed_at"]


async def test_note_longer_than_500_characters_is_rejected(client):
    donation = await create_donation(client, tag="longnote")

    resp = await client.post(
        "/api/pickups",
        json={"donation_id": donation["id"], "note": "x" * 501},
    )
    assert resp.status_code == 400
    assert "500 characters" in resp.json()["detail"]
