"""Dropoff service layer."""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Dropoff, Furniture, Referral, Route
from ..schemas import DropoffCreate, DropoffUpdate

logger = logging.getLogger(__name__)


async def list_dropoffs(db: AsyncSession) -> list[Dropoff]:
    result = await db.execute(
        select(Dropoff).order_by(Dropoff.route_id, Dropoff.created_at)
    )
    return result.scalars().all()


async def get_dropoff(db: AsyncSession, dropoff_id: str) -> Dropoff | None:
    result = await db.execute(select(Dropoff).where(Dropoff.id == dropoff_id))
    return result.scalar_one_or_none()


async def create_dropoff(db: AsyncSession, payload: DropoffCreate) -> Dropoff:
    data = payload.model_dump()
    await _validate_fks(db, data)
    db_dropoff = Dropoff(**data)
    db.add(db_dropoff)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating dropoff: %s", e.orig)
        raise ValueError(f"Unable to create dropoff: {str(e.orig)}") from e
    await db.refresh(db_dropoff)
    return db_dropoff


async def update_dropoff(
    db: AsyncSession, dropoff: Dropoff, payload: DropoffUpdate
) -> Dropoff:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    await _validate_fks(db, data)
    for key, value in data.items():
        setattr(dropoff, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating dropoff %s: %s", dropoff.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(dropoff)
    return dropoff


async def delete_dropoff(db: AsyncSession, dropoff: Dropoff) -> None:
    await db.delete(dropoff)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting dropoff %s: %s", dropoff.id, e.orig)
        raise ValueError(f"Unable to delete dropoff: {str(e.orig)}") from e


async def _validate_fks(db: AsyncSession, data: dict[str, Any]) -> None:
    """Raise ValueError if any provided FK references a non-existent record."""
    if "route_id" in data and data["route_id"]:
        result = await db.execute(select(Route.id).where(Route.id == data["route_id"]))
        if not result.scalar_one_or_none():
            raise ValueError(f"Route with ID '{data['route_id']}' does not exist.")

    if "furniture_id" in data and data["furniture_id"]:
        result = await db.execute(
            select(Furniture.id).where(Furniture.id == data["furniture_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Furniture with ID '{data['furniture_id']}' does not exist."
            )

    if "referral_id" in data and data["referral_id"]:
        result = await db.execute(
            select(Referral.id).where(Referral.id == data["referral_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Referral with ID '{data['referral_id']}' does not exist."
            )
