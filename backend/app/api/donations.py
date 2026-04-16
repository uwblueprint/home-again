"""Donations REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Donation
from ..schemas import Donation as DonationSchema
from ..schemas import DonationCreate, DonationUpdate
from ..services import donations_service

router = APIRouter()


async def get_donation_or_404(
    donation_id: str, db: AsyncSession = Depends(get_db)
) -> Donation:
    donation = await donations_service.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found"
        )
    return donation


@router.get("", response_model=list[DonationSchema])
async def list_donations(db: AsyncSession = Depends(get_db)):
    return await donations_service.list_donations(db)


@router.post("", response_model=DonationSchema, status_code=status.HTTP_201_CREATED)
async def create_donation(payload: DonationCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await donations_service.create_donation(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{donation_id}", response_model=DonationSchema)
async def get_donation(donation: Donation = Depends(get_donation_or_404)):
    return donation


@router.put("/{donation_id}", response_model=DonationSchema)
async def update_donation(
    payload: DonationUpdate,
    donation: Donation = Depends(get_donation_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await donations_service.update_donation(db, donation, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{donation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donation(
    donation: Donation = Depends(get_donation_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await donations_service.delete_donation(db, donation)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
