"""Tests for the inventory item types the donate and referral forms offer."""

import pytest_asyncio
from sqlalchemy import delete, update

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


# ── Quantity rules ────────────────────────────────────────────────────────────


async def quantity_of(client, inventory_id):
    resp = await client.get(f"/api/inventory/{inventory_id}")
    assert resp.status_code == 200, resp.text
    return resp.json()["quantity"]


async def approved_sofa_request(client):
    person = await client.post(
        "/api/clients",
        json={
            "first_name": "Quinn",
            "last_name": "Quantity",
            "birthday": "1990-01-01",
            "family_type": "single",
            "num_children": 0,
            "num_adults": 1,
        },
    )
    referral = (
        await client.post(
            "/api/referrals",
            json={
                "client_id": person.json()["id"],
                "address_line_1": "1 Test St",
                "city": "St. John's",
                "status": "pending",
                "requested_items": [
                    {"item": "Sofa/Couch", "quantity": 1, "inventory_id": "sofa-couch"}
                ],
            },
        )
    ).json()
    item = referral["items"][0]
    await client.post(f"/api/referrals/{referral['id']}/items/{item['id']}/approve")
    route = (
        await client.post("/api/routes", json={"date": "2026-06-15T09:00:00"})
    ).json()
    return referral, item, route


async def set_quantity(db_session, inventory_id, quantity):
    await db_session.execute(
        update(Inventory).where(Inventory.id == inventory_id).values(quantity=quantity)
    )
    await db_session.commit()


async def schedule(client, item, route):
    return await client.post(
        "/api/dropoffs", json={"route_id": route["id"], "referral_item_id": item["id"]}
    )


async def test_scheduling_a_dropoff_takes_one_off_the_count(
    client, db_session, inventory
):
    await set_quantity(db_session, "sofa-couch", 2)
    _, item, route = await approved_sofa_request(client)

    resp = await schedule(client, item, route)
    assert resp.status_code == 201, resp.text
    assert await quantity_of(client, "sofa-couch") == 1


async def test_with_none_left_scheduling_waitlists_the_item(
    client, db_session, inventory
):
    await set_quantity(db_session, "sofa-couch", 0)
    referral, item, route = await approved_sofa_request(client)

    resp = await schedule(client, item, route)
    assert resp.status_code == 409, resp.text
    assert await quantity_of(client, "sofa-couch") == 0
    data = (await client.get(f"/api/referrals/{referral['id']}")).json()
    assert data["items"][0]["status"] == "WAITLISTED"
    assert data["review_status"] == "waitlisted"

    # Once stock comes in, the waitlisted item can be scheduled.
    await set_quantity(db_session, "sofa-couch", 1)
    assert (await schedule(client, item, route)).status_code == 201
    assert await quantity_of(client, "sofa-couch") == 0


async def test_cancelling_a_dropoff_puts_the_unit_back(client, db_session, inventory):
    await set_quantity(db_session, "sofa-couch", 1)
    _, item, route = await approved_sofa_request(client)
    dropoff = (await schedule(client, item, route)).json()
    assert await quantity_of(client, "sofa-couch") == 0

    assert (await client.delete(f"/api/dropoffs/{dropoff['id']}")).status_code == 204
    assert await quantity_of(client, "sofa-couch") == 1


async def test_delivering_doesnt_change_the_count(client, db_session, inventory):
    await set_quantity(db_session, "sofa-couch", 1)
    _, item, route = await approved_sofa_request(client)
    dropoff = (await schedule(client, item, route)).json()

    resp = await client.post(f"/api/dropoffs/{dropoff['id']}/deliver")
    assert resp.status_code == 200, resp.text
    assert await quantity_of(client, "sofa-couch") == 0


async def test_a_picked_up_donation_adds_its_approved_items(
    client, db_session, inventory
):
    await set_quantity(db_session, "sofa-couch", 0)
    donor = (
        await client.post(
            "/api/donors",
            json={
                "first_name": "Dana",
                "last_name": "Donor",
                "email": "dana@inventory.test",
                "phone": "555-0100",
            },
        )
    ).json()
    donation = (
        await client.post("/api/donations", json={"donor_id": donor["id"]})
    ).json()
    items = []
    for _ in range(3):
        resp = await client.post(
            "/api/furniture",
            json={
                **FURNITURE_BASE,
                "donation_id": donation["id"],
                "inventory_id": "sofa-couch",
            },
        )
        items.append(resp.json())
    await client.post(f"/api/furniture/{items[0]['id']}/approve")
    await client.post(f"/api/furniture/{items[1]['id']}/approve")
    await client.post(
        f"/api/furniture/{items[2]['id']}/reject",
        json={"rejection_reason": "condition"},
    )

    resp = await client.put(
        f"/api/donations/{donation['id']}", json={"status": "completed"}
    )
    assert resp.status_code == 200, resp.text
    # Two approved sofas collected; the rejected one wasn't.
    assert await quantity_of(client, "sofa-couch") == 2

    # Saving it as completed again doesn't count them twice.
    await client.put(f"/api/donations/{donation['id']}", json={"status": "completed"})
    assert await quantity_of(client, "sofa-couch") == 2


async def test_declining_a_referral_puts_scheduled_units_back(
    client, db_session, inventory
):
    await set_quantity(db_session, "sofa-couch", 1)
    referral, item, route = await approved_sofa_request(client)
    await schedule(client, item, route)
    assert await quantity_of(client, "sofa-couch") == 0

    resp = await client.put(
        f"/api/referrals/{referral['id']}", json={"status": "declined"}
    )
    assert resp.status_code == 200, resp.text
    assert await quantity_of(client, "sofa-couch") == 1


async def test_deleting_a_referral_puts_scheduled_units_back(
    client, db_session, inventory
):
    await set_quantity(db_session, "sofa-couch", 1)
    referral, item, route = await approved_sofa_request(client)
    await schedule(client, item, route)

    assert (await client.delete(f"/api/referrals/{referral['id']}")).status_code == 204
    assert await quantity_of(client, "sofa-couch") == 1
