"""Donors REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Donor
from ..schemas import Donor as DonorSchema
from ..schemas import DonorCreate, DonorUpdate
from ..services import donor_service

router = APIRouter()


async def get_donor_or_404(donor_id: str, db: AsyncSession = Depends(get_db)) -> Donor:
    donor = await donor_service.get_donor(db, donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found"
        )
    return donor


@router.get("", response_model=list[DonorSchema])
async def list_donors(db: AsyncSession = Depends(get_db)):
    return await donor_service.list_donors(db)


@router.post("", response_model=DonorSchema, status_code=status.HTTP_201_CREATED)
async def create_donor(payload: DonorCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await donor_service.create_donor(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{donor_id}", response_model=DonorSchema)
async def get_donor(donor: Donor = Depends(get_donor_or_404)):
    return donor


@router.put("/{donor_id}", response_model=DonorSchema)
async def update_donor(
    payload: DonorUpdate,
    donor: Donor = Depends(get_donor_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await donor_service.update_donor(db, donor, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{donor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donor(
    donor: Donor = Depends(get_donor_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await donor_service.delete_donor(db, donor)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
