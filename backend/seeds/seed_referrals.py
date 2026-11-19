"""Seed deterministic referral data for local development."""

import asyncio
import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models import Agency, Agent, Client, Inventory, Referral, ReferralItem

AGENCY_ID = "demo-agency"
AGENT_ONE_ID = "demo-agent-maya"
AGENT_TWO_ID = "demo-agent-noah"

CLIENTS = tuple(
    {
        "id": f"client-{index}",
        "first_name": first_name,
        "last_name": last_name,
        "birthday": birthday,
    }
    for index, first_name, last_name, birthday in (
        (1, "Avery", "Johnson", datetime(1990, 4, 12).date()),
        (2, "Jordan", "Williams", datetime(1985, 9, 3).date()),
        (3, "Taylor", "Brown", datetime(1978, 1, 25).date()),
        (4, "Morgan", "Davis", datetime(1994, 6, 18).date()),
        (5, "Riley", "Wilson", datetime(1989, 2, 7).date()),
        (6, "Casey", "Miller", datetime(1975, 12, 30).date()),
        (7, "Sam", "Moore", datetime(2001, 8, 21).date()),
        (8, "Jamie", "Lee", datetime(1982, 10, 14).date()),
        (9, "Alex", "Martin", datetime(1992, 3, 16).date()),
        (10, "Quinn", "Clark", datetime(1987, 7, 9).date()),
        (11, "Emerson", "Lewis", datetime(1996, 11, 22).date()),
        (12, "Parker", "Walker", datetime(1983, 5, 4).date()),
        (13, "Reese", "Hall", datetime(1999, 1, 13).date()),
        (14, "Finley", "Allen", datetime(1979, 9, 27).date()),
        (15, "Dakota", "Young", datetime(1991, 6, 11).date()),
        (16, "Hayden", "King", datetime(1988, 2, 19).date()),
        (17, "Rowan", "Scott", datetime(1995, 12, 5).date()),
        (18, "Skyler", "Green", datetime(1981, 4, 28).date()),
        (19, "Charlie", "Baker", datetime(2000, 10, 8).date()),
    )
)


def make_referral(
    number: int,
    client_number: int,
    status: str,
    created_at: datetime,
    *,
    agent_id: str | None,
    secondary_agent_id: str | None = None,
    is_priority: bool = False,
    priority_description: str | None = None,
    rejection_reason: str | None = None,
    rejection_details: str | None = None,
    items: list[dict[str, object]] | None = None,
) -> dict[str, object]:
    return {
        "id": f"referral-{number}",
        "client_id": f"client-{client_number}",
        "agent_id": agent_id,
        "secondary_agent_id": secondary_agent_id,
        "status": status,
        "is_priority": is_priority,
        "priority_description": priority_description,
        "rejection_reason": rejection_reason,
        "rejection_details": rejection_details,
        "created_at": created_at,
        "items": items or [],
    }


REFERRALS = tuple(
    [
        make_referral(
            1,
            1,
            "pending",
            datetime(2026, 11, 9, 20, 15),
            agent_id=AGENT_ONE_ID,
            secondary_agent_id=AGENT_TWO_ID,
            is_priority=True,
            priority_description="Urgent move-in date.",
            items=[
                {"id": "bed", "name": "Bed frame", "quantity": 1, "stock": 8},
                {"id": "mattress", "name": "Mattress", "quantity": 1, "stock": 3},
            ],
        ),
        make_referral(
            2,
            2,
            "pending",
            datetime(2026, 11, 8, 14, 30),
            agent_id=AGENT_TWO_ID,
            items=[
                {"id": "nightstand", "name": "Nightstand", "quantity": 2, "stock": 1}
            ],
        ),
        make_referral(3, 3, "pending", datetime(2026, 11, 7, 9, 45), agent_id=None),
        make_referral(
            4,
            4,
            "pending",
            datetime(2026, 11, 6, 11, 10),
            agent_id=AGENT_ONE_ID,
            items=[{"id": "sofa", "name": "Sofa", "quantity": 1, "stock": 2}],
        ),
        make_referral(
            5,
            5,
            "pending",
            datetime(2026, 11, 5, 16, 20),
            agent_id=AGENT_TWO_ID,
            is_priority=True,
            priority_description="Accessibility needs identified.",
            items=[{"id": "table", "name": "Dining table", "quantity": 1, "stock": 0}],
        ),
        make_referral(
            6,
            6,
            "pending",
            datetime(2026, 11, 4, 8, 5),
            agent_id=AGENT_ONE_ID,
            items=[{"id": "dresser", "name": "Dresser", "quantity": 1, "stock": 4}],
        ),
        make_referral(
            7, 7, "pending", datetime(2026, 11, 3, 13, 0), agent_id=AGENT_TWO_ID
        ),
        make_referral(
            8,
            8,
            "approved",
            datetime(2026, 11, 9, 10, 0),
            agent_id=AGENT_ONE_ID,
            is_priority=True,
            priority_description="Time-sensitive placement.",
            items=[
                # Review flags provide waitlist states for local UI testing.
                {
                    "id": "crib",
                    "name": "Crib",
                    "quantity": 1,
                    "stock": 0,
                    "reviewed": True,
                    "approved": True,
                }
            ],
        ),
        make_referral(
            9,
            9,
            "approved",
            datetime(2026, 11, 8, 12, 0),
            agent_id=AGENT_TWO_ID,
            secondary_agent_id=AGENT_ONE_ID,
            items=[
                {
                    "id": "chair",
                    "name": "Chair",
                    "quantity": 4,
                    "stock": 6,
                    "reviewed": True,
                    "approved": True,
                },
                {
                    "id": "lamp",
                    "name": "Lamp",
                    "quantity": 2,
                    "stock": 1,
                    "reviewed": False,
                },
            ],
        ),
        make_referral(
            10,
            10,
            "approved",
            datetime(2026, 11, 7, 12, 0),
            agent_id=AGENT_ONE_ID,
            items=[
                {
                    "id": "desk",
                    "name": "Desk",
                    "quantity": 1,
                    "stock": 1,
                    "reviewed": True,
                    "approved": False,
                }
            ],
        ),
        make_referral(
            11,
            11,
            "approved",
            datetime(2026, 11, 6, 12, 0),
            agent_id=AGENT_TWO_ID,
            items=[
                {
                    "id": "table",
                    "name": "Coffee table",
                    "quantity": 1,
                    "stock": 1,
                    "reviewed": True,
                    "approved": True,
                }
            ],
        ),
        make_referral(
            12,
            12,
            "approved",
            datetime(2026, 11, 5, 12, 0),
            agent_id=None,
            items=[
                {
                    "id": "dresser",
                    "name": "Dresser",
                    "quantity": 1,
                    "stock": 2,
                    "reviewed": True,
                    "approved": True,
                },
                {
                    "id": "lamp",
                    "name": "Lamp",
                    "quantity": 1,
                    "stock": 0,
                    "reviewed": True,
                    "approved": False,
                },
            ],
        ),
        make_referral(
            13,
            13,
            "approved",
            datetime(2026, 11, 4, 12, 0),
            agent_id=AGENT_ONE_ID,
            items=[
                {
                    "id": "shelf",
                    "name": "Bookshelf",
                    "quantity": 1,
                    "stock": 3,
                }
            ],
        ),
        make_referral(
            14,
            14,
            "declined",
            datetime(2026, 11, 9, 8, 0),
            agent_id=AGENT_TWO_ID,
            rejection_reason="duplicate",
        ),
        make_referral(
            15,
            15,
            "declined",
            datetime(2026, 11, 8, 8, 0),
            agent_id=AGENT_ONE_ID,
            rejection_reason="location",
            items=[{"id": "sofa", "name": "Sofa", "quantity": 1, "stock": 2}],
        ),
        make_referral(
            16,
            16,
            "declined",
            datetime(2026, 11, 7, 8, 0),
            agent_id=None,
            rejection_reason="incomplete",
        ),
        make_referral(
            17,
            17,
            "declined",
            datetime(2026, 11, 6, 8, 0),
            agent_id=AGENT_TWO_ID,
            rejection_reason="other",
            rejection_details="The client needs items outside the current program scope.",
            items=[{"id": "desk", "name": "Desk", "quantity": 1, "stock": 0}],
        ),
        make_referral(
            18,
            18,
            "declined",
            datetime(2026, 11, 5, 8, 0),
            agent_id=AGENT_ONE_ID,
            rejection_reason="location",
        ),
        make_referral(
            19,
            19,
            "declined",
            datetime(2026, 11, 4, 8, 0),
            agent_id=AGENT_TWO_ID,
            secondary_agent_id=AGENT_ONE_ID,
            rejection_reason="incomplete",
            items=[{"id": "chair", "name": "Armchair", "quantity": 1, "stock": 1}],
        ),
    ]
)


def build_referral_items(
    referral_data: dict[str, object],
) -> tuple[list[dict[str, object]], list[ReferralItem]]:
    """Create the legacy request payload and one row per requested unit."""
    requested_items: list[dict[str, object]] = []
    referral_items: list[ReferralItem] = []
    for position, item in enumerate(referral_data["items"]):
        name = str(item["name"])
        quantity = int(item.get("quantity", 1))
        requested_items.append(
            {
                "item": name,
                "quantity": quantity,
            }
        )
        for unit in range(quantity):
            reviewed = item.get("reviewed") is True
            approved = item.get("approved") is True
            if referral_data["status"] == "declined":
                item_status = "REJECTED"
            elif not reviewed:
                item_status = "PENDING_REVIEW"
            elif approved:
                item_status = "APPROVED"
            else:
                item_status = "REJECTED"
            referral_items.append(
                ReferralItem(
                    id=f"{referral_data['id']}-item-{position}-{unit}",
                    name=name,
                    size=item.get("size"),
                    notes=item.get("notes"),
                    status=item_status,
                    inventory_id=item.get("inventory_id"),
                    position=len(referral_items),
                )
            )
    return requested_items, referral_items


def inventory_rows() -> list[Inventory]:
    """Create varied stock so the local cards show available and unavailable items."""
    quantities = {
        "bed": 4,
        "mattress": 2,
        "nightstand": 1,
        "sofa": 3,
        "table": 0,
        "dresser": 5,
        "crib": 0,
        "chair": 6,
        "lamp": 1,
        "desk": 1,
        "shelf": 2,
    }
    names: dict[str, str] = {}
    for referral_data in REFERRALS:
        for item in referral_data["items"]:
            item_id = str(item["id"])
            names.setdefault(item_id, str(item["name"]))
            item["inventory_id"] = item_id

    return [
        Inventory(
            id=item_id,
            name=name,
            category="demo",
            quantity=quantities.get(item_id, 2),
            position=position,
        )
        for position, (item_id, name) in enumerate(names.items())
    ]


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        agency = await session.get(Agency, AGENCY_ID)
        if agency is None:
            session.add(
                Agency(
                    id=AGENCY_ID,
                    name="Demo Community Agency",
                    address_line_1="100 Main Street",
                    city="Waterloo",
                    postal_code="N2L 3G1",
                    phone_number="519-555-0100",
                )
            )

        for agent_id, first_name, last_name, email in (
            (AGENT_ONE_ID, "Maya", "Chen", "maya.chen@example.com"),
            (AGENT_TWO_ID, "Noah", "Patel", "noah.patel@example.com"),
        ):
            agent = await session.get(Agent, agent_id)
            if agent is None:
                session.add(
                    Agent(
                        id=agent_id,
                        agency_id=AGENCY_ID,
                        first_name=first_name,
                        last_name=last_name,
                        email=email,
                        phone_number="519-555-0101",
                    )
                )

        for client_data in CLIENTS:
            client = await session.get(Client, client_data["id"])
            if client is None:
                session.add(
                    Client(
                        **client_data,
                        family_type="single",
                        num_children=0,
                        num_adults=1,
                        coordinated_access_required=False,
                        speaks_english=True,
                    )
                )

        await session.flush()

        for inventory in inventory_rows():
            if await session.get(Inventory, inventory.id) is None:
                session.add(inventory)

        await session.flush()

        for referral_data in REFERRALS:
            result = await session.execute(
                select(Referral)
                .where(Referral.id == referral_data["id"])
                .options(selectinload(Referral.items))
            )
            referral = result.scalar_one_or_none()
            if referral is None:
                requested_items, referral_items = build_referral_items(referral_data)
                session.add(
                    Referral(
                        id=referral_data["id"],
                        client_id=referral_data["client_id"],
                        agent_id=referral_data["agent_id"],
                        secondary_agent_id=referral_data["secondary_agent_id"],
                        status=referral_data["status"],
                        is_priority=referral_data["is_priority"],
                        priority_description=referral_data["priority_description"],
                        rejection_reason=referral_data["rejection_reason"],
                        rejection_details=referral_data["rejection_details"],
                        requested_items=json.dumps(requested_items),
                        address_line_1="100 Demo Street",
                        city="Waterloo",
                        created_at=referral_data["created_at"],
                        updated_at=referral_data["created_at"],
                        items=referral_items,
                    )
                )
            else:
                # Rebuild demo rows so reruns apply every seed change.
                requested_items, referral_items = build_referral_items(referral_data)
                referral.client_id = referral_data["client_id"]
                referral.agent_id = referral_data["agent_id"]
                referral.secondary_agent_id = referral_data["secondary_agent_id"]
                referral.status = referral_data["status"]
                referral.is_priority = referral_data["is_priority"]
                referral.priority_description = referral_data["priority_description"]
                referral.rejection_reason = referral_data["rejection_reason"]
                referral.rejection_details = referral_data["rejection_details"]
                referral.requested_items = json.dumps(requested_items)
                referral.created_at = referral_data["created_at"]
                referral.updated_at = referral_data["created_at"]
                referral.items = referral_items

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
    print("Demo referral data is ready.")
