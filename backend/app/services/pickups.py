"""Pickup service layer."""

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, Pickup, Route
from ..schemas import PickupCreate, PickupUpdate

logger = logging.getLogger(__name__)

MAX_NOTE_LENGTH = 500


async def list_pickups(db: AsyncSession) -> list[Pickup]:
    result = await db.execute(
        select(Pickup).order_by(Pickup.route_id, Pickup.created_at)
    )
    return result.scalars().all()


async def get_pickup(db: AsyncSession, pickup_id: str) -> Pickup | None:
    result = await db.execute(select(Pickup).where(Pickup.id == pickup_id))
    return result.scalar_one_or_none()


async def create_pickup(db: AsyncSession, payload: PickupCreate) -> Pickup:
    data = payload.model_dump()
    await _validate_fks(db, data)
    _validate_note(data.get("note"))
    db_pickup = Pickup(**data)
    db.add(db_pickup)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating pickup: %s", e.orig)
        raise ValueError(f"Unable to create pickup: {str(e.orig)}") from e
    await db.refresh(db_pickup)
    return db_pickup


async def update_pickup(
    db: AsyncSession, pickup: Pickup, payload: PickupUpdate
) -> Pickup:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    await _validate_fks(db, data)
    if "note" in data:
        _validate_note(data["note"])

    # Moving a confirmed pickup to a new date invalidates the donor's confirmation,
    # so it drops back to unconfirmed and must be re-sent.
    if (
        "scheduled_date" in data
        and pickup.confirmed_at
        and data["scheduled_date"] != pickup.scheduled_date
    ):
        pickup.confirmed_at = None

    for key, value in data.items():
        setattr(pickup, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating pickup %s: %s", pickup.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(pickup)
    return pickup


async def confirm_pickup(db: AsyncSession, pickup: Pickup) -> Pickup:
    """
    Confirm the scheduled date — the point at which the donor is notified.

    Idempotent: re-confirming an already-confirmed pickup keeps the original
    timestamp rather than resetting it.
    """
    if not pickup.scheduled_date:
        raise ValueError("Cannot confirm a pickup that has no scheduled date.")
    if pickup.confirmed_at is None:
        pickup.confirmed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError confirming pickup %s: %s", pickup.id, e.orig)
        raise ValueError(f"Unable to confirm pickup: {str(e.orig)}") from e
    await db.refresh(pickup)
    return pickup


def _validate_note(note: str | None) -> None:
    if note is not None and len(note) > MAX_NOTE_LENGTH:
        raise ValueError(f"note must be {MAX_NOTE_LENGTH} characters or fewer.")


async def delete_pickup(db: AsyncSession, pickup: Pickup) -> None:
    await db.delete(pickup)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting pickup %s: %s", pickup.id, e.orig)
        raise ValueError(f"Unable to delete pickup: {str(e.orig)}") from e


async def _validate_fks(db: AsyncSession, data: dict[str, Any]) -> None:
    """Raise ValueError if any provided FK references a non-existent record."""
    if "route_id" in data and data["route_id"]:
        result = await db.execute(select(Route.id).where(Route.id == data["route_id"]))
        if not result.scalar_one_or_none():
            raise ValueError(f"Route with ID '{data['route_id']}' does not exist.")

    if "donation_id" in data and data["donation_id"]:
        result = await db.execute(
            select(Donation.id).where(Donation.id == data["donation_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Donation with ID '{data['donation_id']}' does not exist."
            )
