"""Dropoff service layer."""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..enums import ReferralItemStatus
from ..models import Dropoff, Furniture, Referral, ReferralItem, Route
from ..schemas import DropoffCreate, DropoffUpdate

# A unit can only be scheduled once review has approved it.
SCHEDULABLE_ITEM_STATUSES = {ReferralItemStatus.APPROVED.value}

logger = logging.getLogger(__name__)


async def list_dropoffs(db: AsyncSession) -> list[Dropoff]:
    result = await db.execute(
        select(Dropoff).order_by(Dropoff.route_id, Dropoff.created_at)
    )
    return result.scalars().all()


async def get_dropoff(db: AsyncSession, dropoff_id: str) -> Dropoff | None:
    result = await db.execute(select(Dropoff).where(Dropoff.id == dropoff_id))
    return result.scalar_one_or_none()


async def _get_item(db: AsyncSession, item_id: str) -> ReferralItem | None:
    result = await db.execute(select(ReferralItem).where(ReferralItem.id == item_id))
    return result.scalar_one_or_none()


async def create_dropoff(db: AsyncSession, payload: DropoffCreate) -> Dropoff:
    """
    Schedule a drop-off. With a referral item, the item must be approved and
    moves to SCHEDULED in the same transaction.
    """
    data = payload.model_dump()
    await _validate_fks(db, data)

    item = None
    if data.get("referral_item_id"):
        item = await _get_item(db, data["referral_item_id"])
        if item is None:
            raise ValueError(
                f"Referral item with ID '{data['referral_item_id']}' does not exist."
            )
        if item.status not in SCHEDULABLE_ITEM_STATUSES:
            raise ValueError("Only approved items can be scheduled for a drop-off.")
        if data.get("referral_id") and data["referral_id"] != item.referral_id:
            raise ValueError("referral_id doesn't match the referral item's referral.")
        data["referral_id"] = item.referral_id
        item.status = ReferralItemStatus.SCHEDULED.value

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


async def deliver_dropoff(db: AsyncSession, dropoff: Dropoff) -> ReferralItem:
    """Mark the drop-off's referral item delivered. Final."""
    item = (
        await _get_item(db, dropoff.referral_item_id)
        if dropoff.referral_item_id
        else None
    )
    if item is None:
        raise ValueError("This drop-off isn't linked to a referral item.")
    if item.status != ReferralItemStatus.SCHEDULED.value:
        raise ValueError("Only a scheduled item can be marked delivered.")
    item.status = ReferralItemStatus.DELIVERED.value
    await db.commit()
    await db.refresh(item)
    return item


async def get_item_dropoff(db: AsyncSession, item_id: str) -> Dropoff | None:
    result = await db.execute(
        select(Dropoff).where(Dropoff.referral_item_id == item_id)
    )
    return result.scalar_one_or_none()


async def release_dropoff(db: AsyncSession, dropoff: Dropoff) -> None:
    """
    Remove a drop-off that hasn't been delivered, without committing, so the
    caller can change the item's status in the same transaction.
    """
    await db.delete(dropoff)


async def delete_dropoff(db: AsyncSession, dropoff: Dropoff) -> None:
    """Cancel a drop-off. Its referral item goes back to APPROVED."""
    if dropoff.referral_item_id:
        item = await _get_item(db, dropoff.referral_item_id)
        if item is not None:
            if item.status == ReferralItemStatus.DELIVERED.value:
                raise ValueError("A delivered drop-off can't be cancelled.")
            item.status = ReferralItemStatus.APPROVED.value
    await release_dropoff(db, dropoff)
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
