"""Furniture REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Furniture
from ..schemas import Furniture as FurnitureSchema
from ..schemas import (
    FurnitureCreate,
    FurnitureDetail,
    FurniturePhoto,
    FurniturePhotoInput,
    FurnitureReject,
    FurnitureUpdate,
)
from ..services import furniture_service

router = APIRouter()


async def get_furniture_or_404(
    furniture_id: str, db: AsyncSession = Depends(get_db)
) -> Furniture:
    furniture = await furniture_service.get_furniture(db, furniture_id)
    if not furniture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Furniture not found"
        )
    return furniture


@router.get("", response_model=list[FurnitureSchema])
async def list_furniture(db: AsyncSession = Depends(get_db)):
    return await furniture_service.list_furniture(db)


@router.post("", response_model=FurnitureSchema, status_code=status.HTTP_201_CREATED)
async def create_furniture(
    payload: FurnitureCreate, db: AsyncSession = Depends(get_db)
):
    try:
        return await furniture_service.create_furniture(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{furniture_id}", response_model=FurnitureSchema)
async def get_furniture(furniture: Furniture = Depends(get_furniture_or_404)):
    return furniture


@router.put("/{furniture_id}", response_model=FurnitureSchema)
async def update_furniture(
    payload: FurnitureUpdate,
    furniture: Furniture = Depends(get_furniture_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await furniture_service.update_furniture(db, furniture, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{furniture_id}/detail", response_model=FurnitureDetail)
async def get_furniture_detail(furniture_id: str, db: AsyncSession = Depends(get_db)):
    """Furniture with its ordered photo set."""
    furniture = await furniture_service.get_furniture_with_photos(db, furniture_id)
    if not furniture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Furniture not found"
        )
    return furniture


@router.put("/{furniture_id}/photos", response_model=list[FurniturePhoto])
async def replace_furniture_photos(
    payload: list[FurniturePhotoInput],
    furniture: Furniture = Depends(get_furniture_or_404),
    db: AsyncSession = Depends(get_db),
):
    """Replace the item's whole photo set; list order becomes display order."""
    try:
        return await furniture_service.replace_furniture_photos(db, furniture, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{furniture_id}/approve", response_model=FurnitureSchema)
async def approve_furniture(
    furniture: Furniture = Depends(get_furniture_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await furniture_service.approve_furniture(db, furniture)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{furniture_id}/reject", response_model=FurnitureSchema)
async def reject_furniture(
    payload: FurnitureReject,
    furniture: Furniture = Depends(get_furniture_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await furniture_service.reject_furniture(db, furniture, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{furniture_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_furniture(
    furniture: Furniture = Depends(get_furniture_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await furniture_service.delete_furniture(db, furniture)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
