"""Tests for referral items and the referral's derived review status."""

import pytest_asyncio
from sqlalchemy import delete
from test_referrals import create_client, create_referral

from app.models import Inventory


@pytest_asyncio.fixture(autouse=True)
async def stock(db_session):
    """Plenty of the requested types, so scheduling isn't blocked on stock."""
    await db_session.execute(
        delete(Inventory).where(Inventory.id.in_(["sofa-couch", "mattress-only-queen"]))
    )
    db_session.add_all(
        [
            Inventory(
                id="sofa-couch", name="Sofa/Couch", category="Seating", quantity=100
            ),
            Inventory(
                id="mattress-only-queen",
                name="Mattress Only",
                size="Queen",
                category="Bed",
                quantity=100,
            ),
        ]
    )
    await db_session.commit()


ITEMS = [
    {"item": "Sofa/Couch", "quantity": 2},
    {"item": "Mattress Only", "size": "Queen", "quantity": 1, "notes": "Twin ok"},
]


async def new_referral(client, **overrides):
    c = await create_client(client)
    return await create_referral(
        client, c["id"], **{"requested_items": ITEMS, **overrides}
    )


async def review(client, referral, index, action, **body):
    item_id = referral["items"][index]["id"]
    resp = await client.post(
        f"/api/referrals/{referral['id']}/items/{item_id}/{action}",
        json=body if action == "reject" else None,
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


async def status_of(client, referral):
    resp = await client.get(f"/api/referrals/{referral['id']}")
    assert resp.status_code == 200, resp.text
    return resp.json()


async def test_creating_a_referral_makes_one_item_per_unit(client):
    referral = await new_referral(client)
    assert referral["item_count"] == 3
    assert [(i["name"], i["size"]) for i in referral["items"]] == [
        ("Sofa/Couch", None),
        ("Sofa/Couch", None),
        ("Mattress Only", "Queen"),
    ]
    assert referral["items"][2]["notes"] == "Twin ok"
    assert all(i["status"] == "PENDING_REVIEW" for i in referral["items"])
    assert referral["review_status"] == "pending_review"
    # The agent's original request is kept as sent.
    assert referral["requested_items"] == ITEMS


async def test_partially_reviewed_until_every_unit_is_reviewed(client):
    referral = await new_referral(client)
    await review(client, referral, 0, "approve")
    assert (await status_of(client, referral))["review_status"] == (
        "partially_reviewed"
    )


async def test_approved_when_every_unit_is_approved(client):
    referral = await new_referral(client)
    for index in range(3):
        await review(client, referral, index, "approve")
    data = await status_of(client, referral)
    assert data["review_status"] == "approved"
    assert (data["approved_count"], data["item_count"]) == (3, 3)


async def test_partially_approved_for_a_mix(client):
    referral = await new_referral(client)
    await review(client, referral, 0, "approve")
    await review(client, referral, 1, "approve")
    item = await review(
        client, referral, 2, "reject", rejection_reason="No queen mattresses"
    )
    assert item["status"] == "REJECTED"
    assert item["rejection_reason"] == "No queen mattresses"
    assert item["reviewed_at"] is not None

    data = await status_of(client, referral)
    assert data["review_status"] == "partially_approved"
    assert data["approved_count"] == 2


async def test_rejected_when_every_unit_is_rejected(client):
    referral = await new_referral(client)
    for index in range(3):
        await review(client, referral, index, "reject")
    data = await status_of(client, referral)
    assert data["review_status"] == "rejected"
    assert data["approved_count"] == 0


async def test_waitlisted_when_an_approved_unit_waits_for_stock(client):
    referral = await new_referral(client)
    await review(client, referral, 0, "approve")
    await review(client, referral, 1, "waitlist")
    await review(client, referral, 2, "approve")
    assert (await status_of(client, referral))["review_status"] == "waitlisted"


async def test_list_includes_each_referrals_status(client):
    referral = await new_referral(client)
    await review(client, referral, 0, "reject")
    resp = await client.get("/api/referrals")
    match = next(r for r in resp.json() if r["id"] == referral["id"])
    assert match["review_status"] == "partially_reviewed"
    assert len(match["items"]) == 3


async def test_reviewing_an_unknown_item_is_404(client):
    referral = await new_referral(client)
    resp = await client.post(f"/api/referrals/{referral['id']}/items/nope/approve")
    assert resp.status_code == 404


async def test_requested_items_can_change_until_review_starts(client):
    referral = await new_referral(client)
    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={"requested_items": [{"item": "Dresser", "quantity": 1}]},
    )
    assert resp.status_code == 200, resp.text
    assert [i["name"] for i in resp.json()["items"]] == ["Dresser"]

    updated = resp.json()
    await review(client, updated, 0, "approve")
    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={"requested_items": [{"item": "Sofa", "quantity": 1}]},
    )
    assert resp.status_code == 400


async def test_deleting_a_referral_deletes_its_items(client):
    referral = await new_referral(client)
    resp = await client.delete(f"/api/referrals/{referral['id']}")
    assert resp.status_code == 204


# ── Drop-offs ─────────────────────────────────────────────────────────────────


async def new_route(client):
    resp = await client.post("/api/routes", json={"date": "2026-06-15T09:00:00"})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def schedule(client, referral, index, route):
    return await client.post(
        "/api/dropoffs",
        json={
            "route_id": route["id"],
            "referral_item_id": referral["items"][index]["id"],
        },
    )


async def test_scheduling_a_dropoff_moves_the_item_to_scheduled(client):
    referral = await new_referral(client)
    route = await new_route(client)
    for index in range(3):
        await review(client, referral, index, "approve")

    resp = await schedule(client, referral, 0, route)
    assert resp.status_code == 201, resp.text
    dropoff = resp.json()
    assert dropoff["referral_id"] == referral["id"]
    assert dropoff["furniture_id"] is None

    data = await status_of(client, referral)
    assert data["items"][0]["status"] == "SCHEDULED"
    # Two units still have no drop-off.
    assert data["review_status"] == "approved"


async def test_scheduled_then_delivered_once_every_unit_is_out(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    await review(client, referral, 1, "approve")
    await review(client, referral, 2, "reject")

    dropoffs = []
    for index in range(2):
        resp = await schedule(client, referral, index, route)
        assert resp.status_code == 201, resp.text
        dropoffs.append(resp.json())
    assert (await status_of(client, referral))["review_status"] == "scheduled"

    for dropoff in dropoffs:
        resp = await client.post(f"/api/dropoffs/{dropoff['id']}/deliver")
        assert resp.status_code == 200, resp.text
        assert resp.json()["status"] == "DELIVERED"
    assert (await status_of(client, referral))["review_status"] == "delivered"


async def test_only_reviewed_units_can_be_scheduled(client):
    referral = await new_referral(client)
    route = await new_route(client)
    resp = await schedule(client, referral, 0, route)
    assert resp.status_code == 400


async def test_a_unit_gets_one_dropoff(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    assert (await schedule(client, referral, 0, route)).status_code == 201
    assert (await schedule(client, referral, 0, route)).status_code == 400


async def test_cancelling_a_dropoff_puts_the_item_back_to_approved(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    dropoff = (await schedule(client, referral, 0, route)).json()

    resp = await client.delete(f"/api/dropoffs/{dropoff['id']}")
    assert resp.status_code == 204
    data = await status_of(client, referral)
    assert data["items"][0]["status"] == "APPROVED"


async def test_a_delivered_dropoff_cant_be_cancelled(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    dropoff = (await schedule(client, referral, 0, route)).json()
    await client.post(f"/api/dropoffs/{dropoff['id']}/deliver")

    resp = await client.delete(f"/api/dropoffs/{dropoff['id']}")
    assert resp.status_code == 400


async def test_a_dropoff_needs_something_to_deliver(client):
    route = await new_route(client)
    resp = await client.post("/api/dropoffs", json={"route_id": route["id"]})
    assert resp.status_code == 422


# ── Rejection reason ──────────────────────────────────────────────────────────


async def test_rejecting_a_referral_records_the_reason(client):
    referral = await new_referral(client)
    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={"status": "declined", "rejection_reason": "location"},
    )
    assert resp.status_code == 200, resp.text
    data = await status_of(client, referral)
    assert data["rejection_reason"] == "location"
    assert data["rejection_details"] is None


async def test_other_needs_details(client):
    referral = await new_referral(client)
    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={"status": "declined", "rejection_reason": "other"},
    )
    assert resp.status_code == 422

    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={
            "status": "declined",
            "rejection_reason": "other",
            "rejection_details": "Client moved away",
        },
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["rejection_details"] == "Client moved away"


async def test_a_reason_needs_a_declined_referral(client):
    referral = await new_referral(client)
    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={"rejection_reason": "duplicate"},
    )
    assert resp.status_code == 400


async def test_unknown_reasons_are_rejected(client):
    referral = await new_referral(client)
    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={"status": "declined", "rejection_reason": "nope"},
    )
    assert resp.status_code == 422


async def test_moving_out_of_rejected_clears_the_reason(client):
    referral = await new_referral(client)
    await client.put(
        f"/api/referrals/{referral['id']}",
        json={"status": "declined", "rejection_reason": "incomplete"},
    )
    resp = await client.put(
        f"/api/referrals/{referral['id']}", json={"status": "approved"}
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["rejection_reason"] is None


# ── Declining and deleting ────────────────────────────────────────────────────


async def test_declining_closes_every_open_unit(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    await review(client, referral, 1, "approve")
    dropoff = (await schedule(client, referral, 1, route)).json()

    resp = await client.put(
        f"/api/referrals/{referral['id']}",
        json={"status": "declined", "rejection_reason": "location"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    # Approved → cancelled, scheduled → cancelled with its drop-off, pending →
    # rejected.
    assert [item["status"] for item in data["items"]] == [
        "CANCELLED",
        "CANCELLED",
        "REJECTED",
    ]
    assert data["review_status"] == "rejected"
    assert (await client.get(f"/api/dropoffs/{dropoff['id']}")).status_code == 404


async def test_declining_keeps_delivered_units(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    dropoff = (await schedule(client, referral, 0, route)).json()
    await client.post(f"/api/dropoffs/{dropoff['id']}/deliver")

    resp = await client.put(
        f"/api/referrals/{referral['id']}", json={"status": "declined"}
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["items"][0]["status"] == "DELIVERED"


async def test_deleting_a_referral_cancels_its_dropoffs(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    dropoff = (await schedule(client, referral, 0, route)).json()

    assert (await client.delete(f"/api/referrals/{referral['id']}")).status_code == 204
    assert (await client.get(f"/api/dropoffs/{dropoff['id']}")).status_code == 404


async def test_a_referral_with_a_delivery_cant_be_deleted(client):
    referral = await new_referral(client)
    route = await new_route(client)
    await review(client, referral, 0, "approve")
    dropoff = (await schedule(client, referral, 0, route)).json()
    await client.post(f"/api/dropoffs/{dropoff['id']}/deliver")

    resp = await client.delete(f"/api/referrals/{referral['id']}")
    assert resp.status_code == 400
