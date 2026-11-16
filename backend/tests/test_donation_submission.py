"""Tests for the donate form submission and the donation-requests list."""

from datetime import datetime

import pytest_asyncio
from sqlalchemy import delete

from app.models import Inventory

DONOR = {
    "first_name": "Katie",
    "last_name": "Sun",
    "phone": "555-7000",
}

SUBMISSION = {
    "address_line_1": "100 Demo Street",
    "city": "St. John's",
    "postal_code": "A1A 1A1",
    "smoking_household": False,
    "has_pets": True,
}


@pytest_asyncio.fixture
async def inventory(db_session):
    await db_session.execute(delete(Inventory))
    db_session.add_all(
        [
            Inventory(id="sofa-couch", name="Sofa/Couch", category="Seating"),
            Inventory(id="dresser", name="Dresser", category="Storage and Shelving"),
            Inventory(
                id="dining-kitchen-table",
                name="Dining/Kitchen Table",
                category="Tables",
            ),
            Inventory(
                id="kitchen-dining-chair",
                name="Kitchen/Dining Chair",
                category="Seating",
            ),
            Inventory(
                id="mattress-only-queen",
                name="Mattress Only",
                size="Queen",
                category="Bed",
            ),
        ]
    )
    await db_session.commit()


async def create_donor(client, tag):
    resp = await client.post(
        "/api/donors", json={**DONOR, "email": f"{tag}@submission.test"}
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_submission_creates_the_donation_and_its_items(client, inventory):
    donor = await create_donor(client, "full")
    resp = await client.post(
        "/api/donations/submissions",
        json={
            **SUBMISSION,
            "donor_id": donor["id"],
            "items": [
                {"furniture_type": "Sofa", "has_stains": False},
                {"furniture_type": "Mattress", "size": "Queen", "has_stains": True},
                {
                    "furniture_type": "Other",
                    "has_stains": False,
                    "other_description": "Rocking horse",
                },
            ],
        },
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["review_status"] == "pending_review"
    assert data["status"] == "pending"
    assert data["has_pets"] is True
    assert data["item_count"] == 3

    items = {item["name"]: item for item in data["furniture_items"]}
    assert items["Sofa"]["inventory_id"] == "sofa-couch"
    assert items["Sofa"]["category"] == "Seating"
    assert items["Sofa"]["description"] == "No stains"
    assert items["Mattress (Queen)"]["inventory_id"] == "mattress-only-queen"
    assert items["Other"]["inventory_id"] is None
    assert items["Other"]["description"] == "No stains. Rocking horse"
    assert all(item["status"] == "PICKUP_PENDING" for item in items.values())


async def test_submission_works_without_login(
    client, unauthenticated_client, inventory
):
    donor = await create_donor(client, "anon")
    anonymous, _app = unauthenticated_client

    resp = await anonymous.post(
        "/api/donations/submissions",
        json={
            **SUBMISSION,
            "donor_id": donor["id"],
            "items": [{"furniture_type": "Dresser", "has_stains": False}],
        },
    )
    assert resp.status_code == 201, resp.text


async def test_submission_rejects_an_unknown_donor(client, inventory):
    resp = await client.post(
        "/api/donations/submissions",
        json={
            **SUBMISSION,
            "donor_id": "missing",
            "items": [{"furniture_type": "Sofa", "has_stains": False}],
        },
    )
    assert resp.status_code == 400


async def test_submission_needs_at_least_one_item(client, inventory):
    donor = await create_donor(client, "empty")
    resp = await client.post(
        "/api/donations/submissions",
        json={**SUBMISSION, "donor_id": donor["id"], "items": []},
    )
    assert resp.status_code == 422


async def test_submission_limits_items_and_chairs(client, inventory):
    """Anyone can post the form, so one request can't create unbounded rows."""
    donor = await create_donor(client, "limits")
    sofa = {"furniture_type": "Sofa", "has_stains": False}
    resp = await client.post(
        "/api/donations/submissions",
        json={**SUBMISSION, "donor_id": donor["id"], "items": [sofa] * 51},
    )
    assert resp.status_code == 422

    resp = await client.post(
        "/api/donations/submissions",
        json={
            **SUBMISSION,
            "donor_id": donor["id"],
            "items": [
                {
                    "furniture_type": "Dining table & chairs /sets",
                    "has_stains": False,
                    "chair_count": 21,
                }
            ],
        },
    )
    assert resp.status_code == 422


async def test_pieces_keep_their_order_when_created_at_ties(
    client, db_session, inventory
):
    """
    Pieces created in one request can share or even reverse created_at (coarse
    or skewed clocks); position keeps them in submitted order.
    """
    from datetime import timedelta

    from sqlalchemy import update

    from app.models import Furniture

    donor = await create_donor(client, "order")
    submitted = (
        await client.post(
            "/api/donations/submissions",
            json={
                **SUBMISSION,
                "donor_id": donor["id"],
                "items": [
                    {"furniture_type": "Sofa", "has_stains": False},
                    {
                        "furniture_type": "Dining table & chairs /sets",
                        "has_stains": False,
                        "chair_count": 2,
                    },
                ],
            },
        )
    ).json()
    # Later pieces get earlier timestamps, so created_at alone would reverse them.
    for i, item in enumerate(submitted["furniture_items"]):
        await db_session.execute(
            update(Furniture)
            .where(Furniture.id == item["id"])
            .values(created_at=datetime(2026, 1, 1) - timedelta(seconds=i))
        )
    await db_session.commit()

    resp = await client.get(f"/api/donations/{submitted['id']}/detail")
    assert resp.status_code == 200, resp.text
    assert [item["name"] for item in resp.json()["furniture_items"]] == [
        "Sofa",
        "Dining table",
        "Dining chair",
        "Dining chair",
    ]


async def test_details_lists_donations_with_their_status(client, inventory):
    donor = await create_donor(client, "list")
    submitted = (
        await client.post(
            "/api/donations/submissions",
            json={
                **SUBMISSION,
                "donor_id": donor["id"],
                "items": [{"furniture_type": "Sofa", "has_stains": False}],
            },
        )
    ).json()

    resp = await client.get("/api/donations/details")
    assert resp.status_code == 200, resp.text
    match = next(d for d in resp.json() if d["id"] == submitted["id"])
    assert match["review_status"] == "pending_review"
    assert match["donor"]["first_name"] == "Katie"
    assert len(match["furniture_items"]) == 1


async def test_a_dining_set_becomes_a_table_and_one_row_per_chair(client, inventory):
    donor = await create_donor(client, "dining")
    resp = await client.post(
        "/api/donations/submissions",
        json={
            **SUBMISSION,
            "donor_id": donor["id"],
            "items": [
                {
                    "furniture_type": "Dining table & chairs /sets",
                    "has_stains": False,
                    "chair_count": 4,
                }
            ],
        },
    )
    assert resp.status_code == 201, resp.text
    items = resp.json()["furniture_items"]
    assert [(i["name"], i["inventory_id"]) for i in items] == [
        ("Dining table", "dining-kitchen-table"),
        *[("Dining chair", "kitchen-dining-chair")] * 4,
    ]
    assert resp.json()["item_count"] == 5


async def test_picking_up_a_dining_set_counts_the_table_and_each_chair(
    client, db_session, inventory
):
    donor = await create_donor(client, "diningstock")
    donation = (
        await client.post(
            "/api/donations/submissions",
            json={
                **SUBMISSION,
                "donor_id": donor["id"],
                "items": [
                    {
                        "furniture_type": "Dining table & chairs /sets",
                        "has_stains": False,
                        "chair_count": 3,
                    }
                ],
            },
        )
    ).json()
    items = donation["furniture_items"]
    for item in items[:3]:
        await client.post(f"/api/furniture/{item['id']}/approve")
    # One chair is broken.
    await client.post(
        f"/api/furniture/{items[3]['id']}/reject",
        json={"rejection_reason": "condition"},
    )

    resp = await client.put(
        f"/api/donations/{donation['id']}", json={"status": "completed"}
    )
    assert resp.status_code == 200, resp.text

    table = (await client.get("/api/inventory/dining-kitchen-table")).json()
    chairs = (await client.get("/api/inventory/kitchen-dining-chair")).json()
    assert (table["quantity"], chairs["quantity"]) == (1, 2)
