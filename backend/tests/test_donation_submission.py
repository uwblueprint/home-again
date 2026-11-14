"""Tests for the donate form submission and the donation-requests list."""

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
