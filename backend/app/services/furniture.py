"""Furniture service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, Furniture, Referral
from ..schemas import FurnitureCreate, FurnitureUpdate

logger = logging.getLogger(__name__)


async def list_furniture(db: AsyncSession) -> list[Furniture]:
    result = await db.execute(select(Furniture).order_by(Furniture.name))
    return result.scalars().all()


async def get_furniture(db: AsyncSession, furniture_id: str) -> Furniture | None:
    result = await db.execute(select(Furniture).where(Furniture.id == furniture_id))
    return result.scalar_one_or_none()


async def create_furniture(db: AsyncSession, payload: FurnitureCreate) -> Furniture:
    data = payload.model_dump()
    await _validate_fks(db, data)
    db_furniture = Furniture(**data)
    db.add(db_furniture)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating furniture: %s", e.orig)
        raise ValueError(f"Unable to create furniture: {str(e.orig)}") from e
    await db.refresh(db_furniture)
    return db_furniture


async def update_furniture(
    db: AsyncSession, furniture: Furniture, payload: FurnitureUpdate
) -> Furniture:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    await _validate_fks(db, data)
    for key, value in data.items():
        setattr(furniture, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception(
            "IntegrityError updating furniture %s: %s", furniture.id, e.orig
        )
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(furniture)
    return furniture


async def delete_furniture(db: AsyncSession, furniture: Furniture) -> None:
    await db.delete(furniture)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception(
            "IntegrityError deleting furniture %s: %s", furniture.id, e.orig
        )
        raise ValueError(f"Unable to delete furniture: {str(e.orig)}") from e


async def _validate_fks(db: AsyncSession, data: dict) -> None:
    """Raise ValueError if any provided FK references a non-existent record."""
    if "donation_id" in data and data["donation_id"]:
        result = await db.execute(
            select(Donation.id).where(Donation.id == data["donation_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Donation with ID '{data['donation_id']}' does not exist."
            )

    if "referral_id" in data and data["referral_id"]:
        result = await db.execute(
            select(Referral.id).where(Referral.id == data["referral_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Referral with ID '{data['referral_id']}' does not exist."
            )
