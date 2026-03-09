"""Donors REST API.

Full CRUD implementation for the Donors resource.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import DonorCreate, DonorUpdate, Donor as DonorSchema
from ..services import donor_service

router = APIRouter()


@router.get("", response_model=list[DonorSchema])
async def list_donors(db: AsyncSession = Depends(get_db)):
    """List all donors."""
    return await donor_service.list_donors(db)


@router.post(
    "",
    response_model=DonorSchema,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"description": "Integrity error (e.g., duplicate donor email)"}},
)
async def create_donor(donor: DonorCreate, db: AsyncSession = Depends(get_db)):
    """Create a new donor."""
    try:
        return await donor_service.create_donor(db, donor)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get(
    "/{donor_id}",
    response_model=DonorSchema,
    status_code=status.HTTP_200_OK,
    responses={404: {"description": "Donor not found"}},
)
async def get_donor(donor_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single donor by ID."""
    donor = await donor_service.get_donor(db, donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )
    return donor


@router.put(
    "/{donor_id}",
    response_model=DonorSchema,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"description": "Integrity error (e.g., duplicate donor email)"},
        404: {"description": "Donor not found"},
    },
)
async def update_donor(
    donor_id: str, payload: DonorUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a donor."""
    donor = await donor_service.get_donor(db, donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )

    try:
        return await donor_service.update_donor(db, donor, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete(
    "/{donor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        400: {
            "description": "Integrity error (e.g., donor has linked furniture records)"
        },
        404: {"description": "Donor not found"},
    },
)
async def delete_donor(donor_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a donor."""
    donor = await donor_service.get_donor(db, donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )

    try:
        await donor_service.delete_donor(db, donor)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return Response(status_code=status.HTTP_204_NO_CONTENT)
