"""Seed deterministic referral data for local development."""

import asyncio
import json
from datetime import datetime

from app.database import AsyncSessionLocal
from app.models import Agency, Agent, Client, Referral


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
            items=[{"id": "nightstand", "name": "Nightstand", "quantity": 2, "stock": 1}],
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
        make_referral(7, 7, "pending", datetime(2026, 11, 3, 13, 0), agent_id=AGENT_TWO_ID),
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
            1,
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
            2,
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
            3,
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
            4,
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
            5,
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
        make_referral(14, 6, "declined", datetime(2026, 11, 9, 8, 0), agent_id=AGENT_TWO_ID),
        make_referral(
            15,
            7,
            "declined",
            datetime(2026, 11, 8, 8, 0),
            agent_id=AGENT_ONE_ID,
            items=[{"id": "sofa", "name": "Sofa", "quantity": 1, "stock": 2}],
        ),
        make_referral(16, 8, "declined", datetime(2026, 11, 7, 8, 0), agent_id=None),
        make_referral(
            17,
            1,
            "declined",
            datetime(2026, 11, 6, 8, 0),
            agent_id=AGENT_TWO_ID,
            items=[{"id": "desk", "name": "Desk", "quantity": 1, "stock": 0}],
        ),
        make_referral(18, 2, "declined", datetime(2026, 11, 5, 8, 0), agent_id=AGENT_ONE_ID),
        make_referral(
            19,
            3,
            "declined",
            datetime(2026, 11, 4, 8, 0),
            agent_id=AGENT_TWO_ID,
            secondary_agent_id=AGENT_ONE_ID,
            items=[{"id": "chair", "name": "Armchair", "quantity": 1, "stock": 1}],
        ),
    ]
)


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

        for referral_data in REFERRALS:
            referral = await session.get(Referral, referral_data["id"])
            if referral is None:
                session.add(
                    Referral(
                        id=referral_data["id"],
                        client_id=referral_data["client_id"],
                        agent_id=referral_data["agent_id"],
                        secondary_agent_id=referral_data["secondary_agent_id"],
                        status=referral_data["status"],
                        is_priority=referral_data["is_priority"],
                        priority_description=referral_data["priority_description"],
                        requested_items=json.dumps(referral_data["items"]),
                        address_line_1="100 Demo Street",
                        city="Waterloo",
                        created_at=referral_data["created_at"],
                        updated_at=referral_data["created_at"],
                    )
                )

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
    print("Demo referral data is ready.")
