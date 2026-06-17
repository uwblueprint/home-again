"""Pickups REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Pickup
from ..schemas import Pickup as PickupSchema
from ..schemas import PickupCreate, PickupUpdate
from ..services import pickups_service

router = APIRouter()


async def get_pickup_or_404(
    pickup_id: str, db: AsyncSession = Depends(get_db)
) -> Pickup:
    pickup = await pickups_service.get_pickup(db, pickup_id)
    if not pickup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pickup not found"
        )
    return pickup


@router.get("", response_model=list[PickupSchema])
async def list_pickups(db: AsyncSession = Depends(get_db)):
    return await pickups_service.list_pickups(db)


@router.post("", response_model=PickupSchema, status_code=status.HTTP_201_CREATED)
async def create_pickup(payload: PickupCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await pickups_service.create_pickup(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{pickup_id}", response_model=PickupSchema)
async def get_pickup(pickup: Pickup = Depends(get_pickup_or_404)):
    return pickup


@router.put("/{pickup_id}", response_model=PickupSchema)
async def update_pickup(
    payload: PickupUpdate,
    pickup: Pickup = Depends(get_pickup_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await pickups_service.update_pickup(db, pickup, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{pickup_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pickup(
    pickup: Pickup = Depends(get_pickup_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await pickups_service.delete_pickup(db, pickup)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
