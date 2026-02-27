"""Donor services module.

Contains business logic for donor-related operations.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Donor

_table_columns = frozenset(Donor.__table__.columns.keys())
_WRITABLE_COLUMNS = _table_columns - {"id", "created_at", "updated_at"}

async def list_donors(db: AsyncSession) -> list[Donor]:
    """List all donors."""
    result = await db.execute(select(Donor).order_by(Donor.name))
    return list(result.scalars().all())

async def create_donor(db: AsyncSession, donor_data) -> Donor:
    """Create a new donor."""
    filtered = {k: v for k, v in donor_data.items() if k in _WRITABLE_COLUMNS}
    db_donor = Donor(**filtered)
    db.add(db_donor)
    await db.commit()
    await db.refresh(db_donor)
    return db_donor

async def get_donor(db: AsyncSession, donor_id: str) -> Donor | None:
    """Get a single donor by ID."""
    result = await db.execute(select(Donor).where(Donor.id == donor_id))
    return result.scalar_one_or_none()

async def update_donor(db: AsyncSession, donor_id: str, update_data) -> Donor | None:
    """Update a donor."""
    donor = await get_donor(db, donor_id)
    if not donor:
        return None
    for key, value in update_data.items():
        if key in _WRITABLE_COLUMNS:
            setattr(donor, key, value)
    db.add(donor)
    await db.commit()
    await db.refresh(donor)
    return donor

async def delete_donor(db: AsyncSession, donor_id: str) -> bool:
    """Delete a donor."""
    donor = await get_donor(db, donor_id)
    if not donor:
        return False
    await db.delete(donor)
    await db.commit()
    return True 

