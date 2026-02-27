"""Donor services module.

Contains business logic for donor-related operations.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Donor
from ..schemas import DonorCreate, DonorUpdate

async def list_donors(db: AsyncSession) -> list[Donor]:
    """List all donors."""
    result = await db.execute(select(Donor).order_by(Donor.name))
    return list(result.scalars().all())

async def create_donor(db: AsyncSession, donor: DonorCreate) -> Donor:
    """Create a new donor."""
    try:
        db_donor = Donor(**donor.model_dump())
        db.add(db_donor)
        await db.commit()
        await db.refresh(db_donor)
        return db_donor
    except Exception:
        await db.rollback()
        raise

async def get_donor(db: AsyncSession, donor_id: str) -> Donor | None:
    """Get a single donor by ID."""
    result = await db.execute(select(Donor).where(Donor.id == donor_id))
    return result.scalar_one_or_none()

async def update_donor(db: AsyncSession, donor_id: str, payload: DonorUpdate) -> Donor | None:
    """Update a donor."""
    donor = await get_donor(db, donor_id)
    if not donor:
        return None
    
    try:
        # Only update fields that were actually provided in the request
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(donor, key, value)
        
        await db.commit()
        await db.refresh(donor)
        return donor
    except Exception:
        await db.rollback()
        raise

async def delete_donor(db: AsyncSession, donor_id: str) -> bool:
    """Delete a donor."""
    donor = await get_donor(db, donor_id)
    if not donor:
        return False
    try:
        await db.delete(donor)
        await db.commit()
        return True
    except Exception:
        await db.rollback()
        raise 

