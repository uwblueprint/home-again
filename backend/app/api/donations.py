"""Donations REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Donation
from ..schemas import Donation as DonationSchema
from ..schemas import (
    DonationCreate,
    DonationDetail,
    DonationSubmission,
    DonationUpdate,
)
from ..services import donations_service

router = APIRouter()
# Anonymous donation form submission (mounted on public_router).
public_router = APIRouter()


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


@public_router.post(
    "", response_model=DonationSchema, status_code=status.HTTP_201_CREATED
)
async def create_donation(payload: DonationCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await donations_service.create_donation(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@public_router.post(
    "/submissions",
    response_model=DonationDetail,
    status_code=status.HTTP_201_CREATED,
)
async def submit_donation(
    payload: DonationSubmission, db: AsyncSession = Depends(get_db)
):
    """The whole donate form: the donation and its items, created together."""
    try:
        donation = await donations_service.submit_donation(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return donations_service.build_donation_detail(donation)


# Declared before /{donation_id} so "details" isn't read as an id.
@router.get("/details", response_model=list[DonationDetail])
async def list_donation_details(db: AsyncSession = Depends(get_db)):
    """Every donation with its donor, items and review status, newest first."""
    donations = await donations_service.list_donation_details(db)
    return [donations_service.build_donation_detail(d) for d in donations]


@router.get("/{donation_id}", response_model=DonationSchema)
async def get_donation(donation: Donation = Depends(get_donation_or_404)):
    return donation


@router.get("/{donation_id}/detail", response_model=DonationDetail)
async def get_donation_detail(donation_id: str, db: AsyncSession = Depends(get_db)):
    """Donation with donor, items, item photos and pickup — one call for the review screen."""
    donation = await donations_service.get_donation_detail(db, donation_id)
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found"
        )
    return donations_service.build_donation_detail(donation)


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
