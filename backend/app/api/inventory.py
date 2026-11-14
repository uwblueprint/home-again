"""Inventory REST API: the item types the donate and referral forms offer."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import Inventory as InventorySchema
from ..services import inventory_service

# Public: the anonymous donate form needs the item types too.
public_router = APIRouter()


@public_router.get("", response_model=list[InventorySchema])
async def list_inventory(db: AsyncSession = Depends(get_db)):
    return await inventory_service.list_inventory(db)


@public_router.get("/{inventory_id}", response_model=InventorySchema)
async def get_inventory_item(inventory_id: str, db: AsyncSession = Depends(get_db)):
    item = await inventory_service.get_inventory_item(db, inventory_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found"
        )
    return item
