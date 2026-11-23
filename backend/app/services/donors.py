"""Donor service layer."""

import logging

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, Donor
from ..schemas import DonorCreate, DonorListItem, DonorUpdate

logger = logging.getLogger(__name__)


class DonorEmailTaken(ValueError):
    """Another donor already has this email."""

    def __init__(self) -> None:
        super().__init__("A donor with this email already exists.")


async def get_donor_by_email(db: AsyncSession, email: str) -> Donor | None:
    result = await db.execute(select(Donor).where(Donor.email == email))
    return result.scalar_one_or_none()


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
    if await get_donor_by_email(db, payload.email):
        raise DonorEmailTaken()
    db_donor = Donor(**payload.model_dump())
    db.add(db_donor)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        # Another request may have added the same email since the check above.
        if await get_donor_by_email(db, payload.email):
            raise DonorEmailTaken() from e
        logger.exception("IntegrityError creating donor: %s", e.orig)
        raise ValueError(f"Unable to create donor: {str(e.orig)}") from e
    await db.refresh(db_donor)
    return db_donor


async def get_or_create_donor(db: AsyncSession, payload: DonorCreate) -> Donor:
    """
    The donor with this email, or a new one from the payload.

    A returning donor's saved details are left as they are.
    """
    existing = await get_donor_by_email(db, payload.email)
    if existing:
        return existing
    try:
        return await create_donor(db, payload)
    except DonorEmailTaken:
        # Another request added this email since the check above.
        return await get_donor_by_email(db, payload.email)


async def update_donor(db: AsyncSession, donor: Donor, payload: DonorUpdate) -> Donor:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    # Read before the commit: after a rollback the instance is expired.
    donor_id = donor.id
    new_email = data.get("email")

    async def email_taken_by_other() -> bool:
        found = await get_donor_by_email(db, new_email) if new_email else None
        return found is not None and found.id != donor_id

    if await email_taken_by_other():
        raise DonorEmailTaken()
    for key, value in data.items():
        setattr(donor, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        if await email_taken_by_other():
            raise DonorEmailTaken() from e
        logger.exception("IntegrityError updating donor %s: %s", donor_id, e.orig)
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
