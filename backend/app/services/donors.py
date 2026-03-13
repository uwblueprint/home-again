"""Donor services module.

Contains business logic for donor-related operations.
"""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Donor
from ..schemas import DonorCreate, DonorUpdate


async def list_donors(db: AsyncSession) -> list[Donor]:
    """List all donors."""
    result = await db.execute(select(Donor).order_by(Donor.last_name, Donor.first_name))
    return result.scalars().all()


async def create_donor(db: AsyncSession, donor: DonorCreate) -> Donor:
    """Create a new donor."""
    try:
        db_donor = Donor(**donor.model_dump())
        db.add(db_donor)
        await db.commit()
        await db.refresh(db_donor)
        return db_donor
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to create donor: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise


async def get_donor(db: AsyncSession, donor_id: str) -> Donor | None:
    """Get a single donor by ID."""
    result = await db.execute(select(Donor).where(Donor.id == donor_id))
    return result.scalar_one_or_none()


async def update_donor(db: AsyncSession, donor: Donor, payload: DonorUpdate) -> Donor:
    """Update a donor."""
    try:
        # Only update fields that were actually provided in the request
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(donor, key, value)

        await db.commit()
        await db.refresh(donor)
        return donor
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to update donor: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise


async def delete_donor(db: AsyncSession, donor: Donor) -> None:
    """Delete a donor."""
    try:
        await db.delete(donor)
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to delete donor: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise
