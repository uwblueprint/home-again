"""Donor service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donor
from ..schemas import DonorCreate, DonorUpdate

logger = logging.getLogger(__name__)


async def list_donors(db: AsyncSession) -> list[Donor]:
    result = await db.execute(select(Donor).order_by(Donor.last_name, Donor.first_name))
    return result.scalars().all()


async def get_donor(db: AsyncSession, donor_id: str) -> Donor | None:
    result = await db.execute(select(Donor).where(Donor.id == donor_id))
    return result.scalar_one_or_none()


async def create_donor(db: AsyncSession, payload: DonorCreate) -> Donor:
    db_donor = Donor(**payload.model_dump())
    db.add(db_donor)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating donor: %s", e.orig)
        raise ValueError(f"Unable to create donor: {str(e.orig)}") from e
    await db.refresh(db_donor)
    return db_donor


async def update_donor(db: AsyncSession, donor: Donor, payload: DonorUpdate) -> Donor:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    for key, value in data.items():
        setattr(donor, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating donor %s: %s", donor.id, e.orig)
        raise ValueError(f"Unable to update donor: {str(e.orig)}") from e
    await db.refresh(donor)
    return donor


async def delete_donor(db: AsyncSession, donor: Donor) -> None:
    await db.delete(donor)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting donor %s: %s", donor.id, e.orig)
        raise ValueError(f"Unable to delete donor: {str(e.orig)}") from e
