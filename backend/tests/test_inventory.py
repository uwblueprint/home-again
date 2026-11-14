"""Tests for the inventory item types the donate and referral forms offer."""

import pytest_asyncio
from sqlalchemy import delete

from app.models import Inventory

FURNITURE_BASE = {
    "name": "Sofa",
    "image_url": "https://example.com/sofa.jpg",
    "description": "No stains",
    "colour": "brown",
    "category": "Seating",
    "smoking_household": False,
    "has_pets": False,
    "status": "PICKUP_PENDING",
}


@pytest_asyncio.fixture
async def inventory(db_session):
    # The test database lives for the whole session; start from a known set.
    await db_session.execute(delete(Inventory))
    rows = [
        Inventory(
            id="mattress-only-queen",
            name="Mattress Only",
            size="Queen",
            category="Bed",
            quantity=2,
            position=1,
        ),
        Inventory(
            id="sofa-couch",
            name="Sofa/Couch",
            category="Seating",
            quantity=0,
            position=0,
        ),
    ]
    db_session.add_all(rows)
    await db_session.commit()
    return rows


async def test_lists_item_types_in_form_order(client, inventory):
    resp = await client.get("/api/inventory")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert [item["id"] for item in data] == ["sofa-couch", "mattress-only-queen"]
    assert data[1]["size"] == "Queen"
    assert data[1]["quantity"] == 2


async def test_inventory_is_readable_without_login(unauthenticated_client, inventory):
    """The anonymous donate form needs the item types."""
    client, _app = unauthenticated_client
    resp = await client.get("/api/inventory")
    assert resp.status_code == 200, resp.text
    assert len(resp.json()) == 2


async def test_gets_one_item_type(client, inventory):
    resp = await client.get("/api/inventory/sofa-couch")
    assert resp.status_code == 200, resp.text
    assert resp.json()["name"] == "Sofa/Couch"


async def test_unknown_item_type_is_404(client, inventory):
    resp = await client.get("/api/inventory/nope")
    assert resp.status_code == 404


async def test_furniture_records_its_inventory_type(client, inventory):
    resp = await client.post(
        "/api/furniture", json={**FURNITURE_BASE, "inventory_id": "sofa-couch"}
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["inventory_id"] == "sofa-couch"

    resp = await client.put(
        f"/api/furniture/{resp.json()['id']}", json={"inventory_id": None}
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["inventory_id"] is None


async def test_referral_items_record_the_type_asked_for(client, inventory):
    agency_free_client = await client.post(
        "/api/clients",
        json={
            "first_name": "Ivy",
            "last_name": "Inventory",
            "birthday": "1990-01-01",
            "family_type": "single",
            "num_children": 0,
            "num_adults": 1,
        },
    )
    assert agency_free_client.status_code == 201, agency_free_client.text
    resp = await client.post(
        "/api/referrals",
        json={
            "client_id": agency_free_client.json()["id"],
            "address_line_1": "1 Test St",
            "city": "St. John's",
            "status": "pending",
            "requested_items": [
                # From the referral form, which sends inventory_id.
                {"item": "Sofa/Couch", "quantity": 1, "inventory_id": "sofa-couch"},
                # Matched by name and size.
                {"item": "Mattress Only", "size": "Queen", "quantity": 1},
                # An id that doesn't exist falls back to the name, which
                # doesn't match either.
                {"item": "Rocking horse", "inventory_id": "nope"},
            ],
        },
    )
    assert resp.status_code == 201, resp.text
    assert [item["inventory_id"] for item in resp.json()["items"]] == [
        "sofa-couch",
        "mattress-only-queen",
        None,
    ]
