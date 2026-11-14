"""Inventory service layer."""

from sqlalchemy import func, select, update
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
        # Quantities change through UPDATE statements; always read fresh.
        .execution_options(populate_existing=True)
    )
    return result.scalars().all()


async def get_inventory_item(db: AsyncSession, inventory_id: str) -> Inventory | None:
    result = await db.execute(
        select(Inventory)
        .where(Inventory.id == inventory_id)
        .execution_options(populate_existing=True)
    )
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


# ── Quantity ──────────────────────────────────────────────────────────────────
# The count only changes here, and never commits: callers change it in the same
# transaction as the status change that causes it.


class OutOfStockError(ValueError):
    """Raised when a unit is needed but the type's quantity is 0."""


async def take_one(db: AsyncSession, inventory_id: str) -> bool:
    """
    Subtract 1 if any are left. One atomic UPDATE, so two drop-offs scheduled
    at once can't take the last unit twice. Returns whether one was taken.
    """
    result = await db.execute(
        update(Inventory)
        .where(Inventory.id == inventory_id, Inventory.quantity > 0)
        .values(quantity=Inventory.quantity - 1)
        .execution_options(synchronize_session=False)
    )
    return result.rowcount == 1


async def add(db: AsyncSession, inventory_id: str, count: int = 1) -> None:
    """Add units back, or newly collected ones."""
    await db.execute(
        update(Inventory)
        .where(Inventory.id == inventory_id)
        .values(quantity=Inventory.quantity + count)
        .execution_options(synchronize_session=False)
    )
