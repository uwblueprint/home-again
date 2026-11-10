"""Donor service layer."""

import logging

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, Donor
from ..schemas import DonorCreate, DonorListItem, DonorUpdate

logger = logging.getLogger(__name__)


async def list_donors(db: AsyncSession) -> list[DonorListItem]:
    """
    All donors with their donation count and latest donation date, by name.

    Outer join so donors with no donations still appear. Donations of any
    status count.
    """
    donation_count = func.count(Donation.id).label("donation_count")
    last_donated_at = func.max(Donation.created_at).label("last_donated_at")
    result = await db.execute(
        select(*Donor.__table__.columns, donation_count, last_donated_at)
        .outerjoin(Donation, Donation.donor_id == Donor.id)
        .group_by(Donor.id)
        .order_by(Donor.last_name, Donor.first_name, Donor.id)
    )
    return [DonorListItem.model_validate(row) for row in result.mappings()]


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
