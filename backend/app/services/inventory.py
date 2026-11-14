"""Inventory service layer."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Inventory


async def list_inventory(db: AsyncSession) -> list[Inventory]:
    """Every item type, in form display order."""
    result = await db.execute(
        select(Inventory).order_by(Inventory.position, Inventory.id)
    )
    return result.scalars().all()


async def get_inventory_item(db: AsyncSession, inventory_id: str) -> Inventory | None:
    result = await db.execute(select(Inventory).where(Inventory.id == inventory_id))
    return result.scalar_one_or_none()
