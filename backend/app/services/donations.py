"""Donation services module.

Contains business logic for donation-related operations.
"""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.base import Donation, Donor
from ..schemas import DonationCreate, DonationUpdate


async def list_donations(db: AsyncSession) -> list[Donation]:
    """Return all donations ordered by newest first."""
    result = await db.execute(select(Donation).order_by(Donation.created_at.desc()))
    return result.scalars().all()


async def get_donation(db: AsyncSession, donation_id: str) -> Donation | None:
    """Return a single donation by ID or None when not found."""
    result = await db.execute(select(Donation).where(Donation.id == donation_id))
    return result.scalar_one_or_none()


async def donor_exists(db: AsyncSession, donor_id: str) -> bool:
    """Return whether a donor exists for a given ID."""
    if not donor_id:
        return False

    result = await db.execute(select(Donor.id).where(Donor.id == donor_id))
    return result.scalar_one_or_none() is not None


async def create_donation(db: AsyncSession, payload: DonationCreate) -> Donation:
    """Create and persist a new donation."""
    db_donation = Donation(**payload.model_dump())
    db.add(db_donation)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to create donation: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise

    await db.refresh(db_donation)
    return db_donation


async def update_donation(
    db: AsyncSession, donation: Donation, payload: DonationUpdate
) -> Donation:
    """Apply a partial update to an existing donation."""
    data = payload.model_dump(exclude_unset=True)

    if not data:
        raise ValueError("No update fields were provided.")

    for key, value in data.items():
        setattr(donation, key, value)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise

    await db.refresh(donation)
    return donation


async def delete_donation(db: AsyncSession, donation: Donation) -> None:
    """Delete an existing donation."""
    await db.delete(donation)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to delete donation: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise
