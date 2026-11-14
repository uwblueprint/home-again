"""Dropoffs REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Dropoff
from ..schemas import Dropoff as DropoffSchema
from ..schemas import DropoffCreate, DropoffUpdate, ReferralItem
from ..services import dropoffs_service, inventory_service

router = APIRouter()


async def get_dropoff_or_404(
    dropoff_id: str, db: AsyncSession = Depends(get_db)
) -> Dropoff:
    dropoff = await dropoffs_service.get_dropoff(db, dropoff_id)
    if not dropoff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dropoff not found"
        )
    return dropoff


@router.get("", response_model=list[DropoffSchema])
async def list_dropoffs(db: AsyncSession = Depends(get_db)):
    return await dropoffs_service.list_dropoffs(db)


@router.post("", response_model=DropoffSchema, status_code=status.HTTP_201_CREATED)
async def create_dropoff(payload: DropoffCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await dropoffs_service.create_dropoff(db, payload)
    except inventory_service.OutOfStockError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{dropoff_id}", response_model=DropoffSchema)
async def get_dropoff(dropoff: Dropoff = Depends(get_dropoff_or_404)):
    return dropoff


@router.put("/{dropoff_id}", response_model=DropoffSchema)
async def update_dropoff(
    payload: DropoffUpdate,
    dropoff: Dropoff = Depends(get_dropoff_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await dropoffs_service.update_dropoff(db, dropoff, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{dropoff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dropoff(
    dropoff: Dropoff = Depends(get_dropoff_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await dropoffs_service.delete_dropoff(db, dropoff)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{dropoff_id}/deliver", response_model=ReferralItem)
async def deliver_dropoff(
    dropoff: Dropoff = Depends(get_dropoff_or_404),
    db: AsyncSession = Depends(get_db),
):
    """Mark the drop-off's referral item delivered."""
    try:
        return await dropoffs_service.deliver_dropoff(db, dropoff)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
