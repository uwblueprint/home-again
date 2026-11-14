"""Inventory service layer."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Inventory

# Donate-form type names (lower-cased) that differ from an inventory name.
# Sized types ("mattress", "boxspring") resolve through SIZED_TYPES instead.
DONATE_TYPE_ALIASES = {
    "sofa": "sofa-couch",
    "loveseat": "love-seat",
    "plush chair": "upholstered-arm-chair",
    "bookshelf": "bookcase",
    "lamp": "table-lamp",
    "tv stand": "tv-stand",
    "coffee table": "coffee-table",
    "side/end table": "side-end-table",
    "dining table & chairs /sets": "dining-kitchen-table",
}

# Donate-form types that come in sizes → inventory id prefix.
SIZED_TYPES = {
    "mattress": "mattress-only",
    "boxspring": "box-spring-only",
}


async def list_inventory(db: AsyncSession) -> list[Inventory]:
    """Every item type, in form display order."""
    result = await db.execute(
        select(Inventory).order_by(Inventory.position, Inventory.id)
    )
    return result.scalars().all()


async def get_inventory_item(db: AsyncSession, inventory_id: str) -> Inventory | None:
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    return result.scalar_one_or_none()


def _slug(value: str) -> str:
    return value.strip().lower().replace("/", "-").replace(" ", "-")


async def resolve_inventory_item(
    db: AsyncSession, name: str, size: str | None = None
) -> Inventory | None:
    """
    The inventory type a donated item belongs to, or None if none matches
    ("Other", or a sized type without a size). Matches the inventory name
    first, then the donate form's own names.
    """
    key = name.strip().lower()
    if key in SIZED_TYPES:
        if not size:
            return None
        return await get_inventory_item(db, f"{SIZED_TYPES[key]}-{_slug(size)}")
    if key in DONATE_TYPE_ALIASES:
        return await get_inventory_item(db, DONATE_TYPE_ALIASES[key])

    conditions = [func.lower(Inventory.name) == key]
    conditions.append(
        Inventory.size.is_(None)
        if size is None
        else func.lower(Inventory.size) == size.strip().lower()
    )
    result = await db.execute(select(Inventory).where(*conditions).limit(1))
    return result.scalar_one_or_none()
