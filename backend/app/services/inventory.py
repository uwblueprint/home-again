"""Inventory service layer."""

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..enums import ReferralItemStatus
from ..models import Inventory, ReferralItem

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
    # Sizes "TW/DB" and "DB/QN", as the frames are stocked.
    "bed frames": "metal-bed-frame",
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


# ── Quantity, held and available ─────────────────────────────────────────────
# quantity is what's physically on hand: +1 when a donation is picked up, −1
# when a drop-off is delivered. held is never stored: it's the referral units
# approved or scheduled but not yet delivered. available = quantity − held.
# The count only changes here, and never commits: callers change it in the same
# transaction as the status change that causes it.

HELD_ITEM_STATUSES = (
    ReferralItemStatus.APPROVED.value,
    ReferralItemStatus.SCHEDULED.value,
)


async def held_counts(db: AsyncSession) -> dict[str, int]:
    """Units held for referrals, per inventory type."""
    result = await db.execute(
        select(ReferralItem.inventory_id, func.count())
        .where(
            ReferralItem.inventory_id.is_not(None),
            ReferralItem.status.in_(HELD_ITEM_STATUSES),
        )
        .group_by(ReferralItem.inventory_id)
    )
    return {inventory_id: count for inventory_id, count in result.all()}


def with_counts(item: Inventory, held: int) -> dict:
    """An inventory row for the API, with its held and available counts."""
    return {
        **{
            column.name: getattr(item, column.name) for column in item.__table__.columns
        },
        "held": held,
        "available": item.quantity - held,
    }


async def list_inventory_with_counts(db: AsyncSession) -> list[dict]:
    held = await held_counts(db)
    return [
        with_counts(item, held.get(item.id, 0)) for item in await list_inventory(db)
    ]


async def get_inventory_item_with_counts(
    db: AsyncSession, inventory_id: str
) -> dict | None:
    item = await get_inventory_item(db, inventory_id)
    if item is None:
        return None
    return with_counts(item, (await held_counts(db)).get(inventory_id, 0))


class OutOfStockError(ValueError):
    """Raised when a unit is needed but the type's quantity is 0."""


async def set_quantity(db: AsyncSession, inventory_id: str, quantity: int) -> bool:
    """
    Set the on-hand count after a stock take or correction, and commit. It may
    go below what's held; available then shows the shortfall. Returns whether
    the type exists.
    """
    result = await db.execute(
        update(Inventory)
        .where(Inventory.id == inventory_id)
        .values(quantity=quantity)
        .execution_options(synchronize_session=False)
    )
    if result.rowcount != 1:
        await db.rollback()
        return False
    await db.commit()
    return True


async def hold_one(db: AsyncSession, inventory_id: str) -> None:
    """
    Check one more unit of the type can be held, before approving a referral
    unit for it. Locks the type's row until the caller commits, so two
    approvals at once can't both take the last available unit.
    """
    result = await db.execute(
        select(Inventory.quantity).where(Inventory.id == inventory_id).with_for_update()
    )
    quantity = result.scalar_one_or_none()
    if quantity is None:
        return
    held = (
        await db.execute(
            select(func.count())
            .select_from(ReferralItem)
            .where(
                ReferralItem.inventory_id == inventory_id,
                ReferralItem.status.in_(HELD_ITEM_STATUSES),
            )
        )
    ).scalar_one()
    if quantity - held <= 0:
        raise OutOfStockError(
            "None available: every unit in stock is already held for a referral."
        )


async def take_one(db: AsyncSession, inventory_id: str) -> bool:
    """
    Subtract 1 if any are left, when a unit is delivered. One atomic UPDATE,
    so two deliveries at once can't take the last unit twice. Returns whether
    one was taken.
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
