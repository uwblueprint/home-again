"""Donations REST API.

Full CRUD implementation for the Donations resource.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import Donation as DonationSchema
from ..schemas import DonationCreate, DonationUpdate
from ..services import donations as donations_service

router = APIRouter()


@router.get("", response_model=list[DonationSchema], status_code=status.HTTP_200_OK)
async def list_donations(db: AsyncSession = Depends(get_db)):
    """List all donations."""
    return await donations_service.list_donations(db)


@router.post("", response_model=DonationSchema, status_code=status.HTTP_201_CREATED)
async def create_donation(
    payload: DonationCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new donation."""
    if not await donations_service.donor_exists(db, payload.donor_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )

    try:
        return await donations_service.create_donation(db, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get(
    "/{donation_id}", response_model=DonationSchema, status_code=status.HTTP_200_OK
)
async def get_donation(
    donation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single donation by ID."""
    donation = await donations_service.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found",
        )
    return donation


@router.put(
    "/{donation_id}", response_model=DonationSchema, status_code=status.HTTP_200_OK
)
async def update_donation(
    donation_id: str,
    payload: DonationUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing donation."""
    donation = await donations_service.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "donor_id" in update_data and payload.donor_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="donor_id cannot be null",
        )

    if "donor_id" in update_data and not await donations_service.donor_exists(
        db, payload.donor_id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )

    try:
        return await donations_service.update_donation(db, donation, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete("/{donation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donation(
    donation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete an existing donation."""
    donation = await donations_service.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found",
        )

    try:
        await donations_service.delete_donation(db, donation)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
