"""Furniture REST API.

Endpoints for the Furniture resource.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from ..config import get_settings
from ..database import get_db
from ..schemas import FurnitureCreate, FurnitureUpdate, Furniture as FurnitureSchema
from ..services import furniture_service

router = APIRouter()


@router.get("", response_model=list[FurnitureSchema])
async def list_furniture(db: AsyncSession = Depends(get_db)):
    """List furniture items."""
    return await furniture_service.list_furniture(db)


@router.post("", response_model=FurnitureSchema, status_code=status.HTTP_201_CREATED)
async def create_furniture(
    furniture: FurnitureCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new furniture item."""
    try:
        return await furniture_service.create_furniture(furniture, db)
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid reference: donor_id, client_id, or dispatch_id must "
                "reference existing rows."
            ),
        ) from e
    except Exception as e:
        await db.rollback()
        if get_settings().DEBUG:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
            ) from e
        raise


@router.get("/{furniture_id}", response_model=FurnitureSchema)
async def get_furniture(furniture_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single furniture item by ID."""
    furniture = await furniture_service.get_furniture(furniture_id, db)
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
    furniture = await furniture_service.update_furniture(
        furniture_id, payload, db
    )
    if not furniture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Furniture not found",
        )
    return furniture


@router.delete("/{furniture_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_furniture(furniture_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a furniture item."""
    deleted = await furniture_service.delete_furniture(furniture_id, db)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Furniture not found",
        )
