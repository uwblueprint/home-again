"""Donors REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Donor
from ..schemas import DonationDetail
from ..schemas import Donor as DonorSchema
from ..schemas import DonorCreate, DonorListItem, DonorRef, DonorUpdate
from ..services import donations_service, donor_service

router = APIRouter()
# Anonymous donate form submission (mounted on public_router).
public_router = APIRouter()


async def get_donor_or_404(donor_id: str, db: AsyncSession = Depends(get_db)) -> Donor:
    donor = await donor_service.get_donor(db, donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found"
        )
    return donor


@router.get("", response_model=list[DonorListItem])
async def list_donors(db: AsyncSession = Depends(get_db)):
    return await donor_service.list_donors(db)


@public_router.post("", response_model=DonorRef, status_code=status.HTTP_201_CREATED)
async def create_donor(payload: DonorCreate, db: AsyncSession = Depends(get_db)):
    """
    Start a donation as this donor; the donate form calls this before login.

    A returning donor (same email) gets their existing id. Only the id comes
    back, so an anonymous caller can't read a donor's details by email.
    """
    try:
        return await donor_service.get_or_create_donor(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{donor_id}", response_model=DonorSchema)
async def get_donor(donor: Donor = Depends(get_donor_or_404)):
    return donor


@router.get("/{donor_id}/donations", response_model=list[DonationDetail])
async def list_donor_donations(
    donor: Donor = Depends(get_donor_or_404),
    db: AsyncSession = Depends(get_db),
):
    """The donor's donations, newest first, each with its items and review status."""
    donations = await donations_service.list_donor_donation_details(db, donor.id)
    return [donations_service.build_donation_detail(d) for d in donations]


@router.put("/{donor_id}", response_model=DonorSchema)
async def update_donor(
    payload: DonorUpdate,
    donor: Donor = Depends(get_donor_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await donor_service.update_donor(db, donor, payload)
    except donor_service.DonorEmailTaken as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
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
