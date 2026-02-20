"""Furniture REST API.

Endpoints for the Furniture resource.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models import Furniture
from ..schemas import FurnitureCreate, FurnitureUpdate, Furniture as FurnitureSchema

router = APIRouter()


@router.get("", response_model=list[FurnitureSchema])
async def list_furniture(db: AsyncSession = Depends(get_db)):
    """List furniture items."""
    result = await db.execute(select(Furniture).order_by(Furniture.name))
    return list(result.scalars().all())


@router.post("", response_model=FurnitureSchema, status_code=status.HTTP_201_CREATED)
async def create_furniture(furniture: FurnitureCreate, db: AsyncSession = Depends(get_db)):
    """Create a new furniture item."""
    data = {k: v for k, v in furniture.model_dump().items() if k in _FURNITURE_COLUMN_NAMES}
    try:
        db_furniture = Furniture(**data)
        db.add(db_furniture)
        await db.commit()
        await db.refresh(db_furniture)
        return db_furniture
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reference: donor_id, client_id, or dispatch_id must reference existing rows.",
        ) from e
    except Exception as e:
        await db.rollback()
        if get_settings().DEBUG:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e
        raise


@router.get("/{furniture_id}", response_model=FurnitureSchema)
async def get_furniture(furniture_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single furniture item by ID."""
    result = await db.execute(select(Furniture).where(Furniture.id == furniture_id))
    furniture = result.scalar_one_or_none()
    if not furniture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Furniture not found",
        )
    return furniture


@router.put("/{furniture_id}", response_model=FurnitureSchema)
async def update_furniture(
    furniture_id: str,
    payload: FurnitureUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a furniture item."""
    result = await db.execute(select(Furniture).where(Furniture.id == furniture_id))
    furniture = result.scalar_one_or_none()
    if not furniture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Furniture not found",
        )
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(furniture, key, value)
    await db.commit()
    await db.refresh(furniture)
    return furniture


@router.delete("/{furniture_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_furniture(furniture_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a furniture item."""
    result = await db.execute(select(Furniture).where(Furniture.id == furniture_id))
    furniture = result.scalar_one_or_none()
    if not furniture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Furniture not found",
        )
    await db.delete(furniture)
    await db.commit()