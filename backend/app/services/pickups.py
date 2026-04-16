"""Pickup service layer."""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, Pickup, Route
from ..schemas import PickupCreate, PickupUpdate

logger = logging.getLogger(__name__)


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
            raise ValueError(f"Donation with ID '{data['donation_id']}' does not exist.")
