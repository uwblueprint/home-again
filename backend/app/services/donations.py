"""Donation service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, Donor
from ..schemas import DonationCreate, DonationUpdate

logger = logging.getLogger(__name__)


async def list_donations(db: AsyncSession) -> list[Donation]:
    result = await db.execute(select(Donation).order_by(Donation.created_at.desc()))
    return result.scalars().all()


async def get_donation(db: AsyncSession, donation_id: str) -> Donation | None:
    result = await db.execute(select(Donation).where(Donation.id == donation_id))
    return result.scalar_one_or_none()


async def create_donation(db: AsyncSession, payload: DonationCreate) -> Donation:
    # Validate donor exists before attempting insert
    donor_result = await db.execute(
        select(Donor.id).where(Donor.id == payload.donor_id)
    )
    if not donor_result.scalar_one_or_none():
        raise ValueError(f"Donor with ID '{payload.donor_id}' does not exist.")

    db_donation = Donation(**payload.model_dump())
    db.add(db_donation)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating donation: %s", e.orig)
        raise ValueError(f"Unable to create donation: {str(e.orig)}") from e
    await db.refresh(db_donation)
    return db_donation


async def update_donation(
    db: AsyncSession, donation: Donation, payload: DonationUpdate
) -> Donation:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")

    # Validate new donor_id if provided
    if "donor_id" in data:
        if not data["donor_id"]:
            raise ValueError("donor_id cannot be null.")
        donor_result = await db.execute(
            select(Donor.id).where(Donor.id == data["donor_id"])
        )
        if not donor_result.scalar_one_or_none():
            raise ValueError(f"Donor with ID '{data['donor_id']}' does not exist.")

    for key, value in data.items():
        setattr(donation, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating donation %s: %s", donation.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(donation)
    return donation


async def delete_donation(db: AsyncSession, donation: Donation) -> None:
    await db.delete(donation)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting donation %s: %s", donation.id, e.orig)
        raise ValueError(f"Unable to delete donation: {str(e.orig)}") from e
