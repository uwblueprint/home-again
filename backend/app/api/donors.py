"""Donors REST API.

Full CRUD implementation for the Donors resource.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..database import get_db
from ..schemas import DonorCreate, DonorUpdate, Donor as DonorSchema
from ..services import donor_service

router = APIRouter()


@router.get("", response_model=list[DonorSchema])
async def list_donors(db: AsyncSession = Depends(get_db)):
    """List all donors."""
    return await donor_service.list_donors(db)


@router.post("", response_model=DonorSchema, status_code=status.HTTP_201_CREATED)
async def create_donor(donor: DonorCreate, db: AsyncSession = Depends(get_db)):
    """Create a new donor."""
    try: 
        return await donor_service.create_donor(db, donor.model_dump())
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Donor with this information already exists or violates database constraints",
        ) from e
    except Exception as e:
        await db.rollback()
        if get_settings().DEBUG:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            ) from e
        raise
    

@router.get("/{donor_id}", response_model=DonorSchema, status_code=status.HTTP_200_OK)
async def get_donor(donor_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single donor by ID."""
    donor = await donor_service.get_donor(db, donor_id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )
    return donor

@router.put("/{donor_id}", response_model=DonorSchema, status_code=status.HTTP_200_OK)
async def update_donor(donor_id: str, payload: DonorUpdate, db: AsyncSession = Depends(get_db)):
    """Update a donor."""
    try:
        donor = await donor_service.update_donor(db, donor_id, payload.model_dump(exclude_unset=True))
        if not donor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Donor not found",
            )
        return donor
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Update violates database constraints",
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        if get_settings().DEBUG:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            ) from e
        raise

@router.delete("/{donor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donor(donor_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a donor."""
    try:
        deleted = await donor_service.delete_donor(db, donor_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Donor not found",
            )
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete donor: related records exist",
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        if get_settings().DEBUG:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            ) from e
        raise


