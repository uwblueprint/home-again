"""Furniture service.

CRUD and business logic for the Furniture resource.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Furniture

# Column names: writable for create (exclude id, created_at, updated_at)
_table_columns = frozenset(Furniture.__table__.c.keys())
_WRITABLE_COLUMNS = _table_columns - {"id", "created_at", "updated_at"}


async def list_furniture(db: AsyncSession) -> list[Furniture]:
    """Return furniture items ordered by name."""
    result = await db.execute(select(Furniture).order_by(Furniture.name))
    return list(result.scalars().all())


async def get_furniture(furniture_id: str, db: AsyncSession) -> Furniture | None:
    """Return a furniture item by id, or None if not found."""
    result = await db.execute(select(Furniture).where(Furniture.id == furniture_id))
    return result.scalar_one_or_none()


async def create_furniture(data: dict, db: AsyncSession) -> Furniture:
    """Create a furniture item. Caller must commit; IntegrityError may be raised."""
    filtered = {k: v for k, v in data.items() if k in _WRITABLE_COLUMNS}
    db_furniture = Furniture(**filtered)
    db.add(db_furniture)
    await db.commit()
    await db.refresh(db_furniture)
    return db_furniture


async def update_furniture(
    furniture_id: str,
    data: dict,
    db: AsyncSession,
) -> Furniture | None:
    """Update a furniture item by id. Returns None if not found."""
    furniture = await get_furniture(furniture_id, db)
    if not furniture:
        return None
    for key, value in data.items():
        if key in _WRITABLE_COLUMNS:
            setattr(furniture, key, value)
    await db.commit()
    await db.refresh(furniture)
    return furniture


async def delete_furniture(furniture_id: str, db: AsyncSession) -> bool:
    """Delete a furniture item by id. Returns True if deleted, False if not found."""
    furniture = await get_furniture(furniture_id, db)
    if not furniture:
        return False
    await db.delete(furniture)
    await db.commit()
    return True
