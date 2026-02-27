"""Donors REST API.

Full CRUD implementation for the Donors resource.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Donor
from ..schemas import DonorCreate, DonorUpdate, Donor as DonorSchema

router = APIRouter()


@router.get("", response_model=list[DonorSchema])
async def list_donors(db: AsyncSession = Depends(get_db)):
    """List all donors."""
    result = await db.execute(select(Donor).order_by(Donor.name))
    return list(result.scalars().all())


@router.post("", response_model=DonorSchema)
async def create_donor(donor: DonorCreate, db: AsyncSession = Depends(get_db)):
    """Create a new donor."""
    db_donor = Donor(**donor.model_dump())
    db.add(db_donor)
    await db.commit()
    await db.refresh(db_donor)
    return db_donor

@router.get("/{donor_id}", response_model=DonorSchema, status_code=status.HTTP_200_OK)
async def get_donor(donor_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single donor by ID."""
    result = await db.execute(select(Donor).where(Donor.id == donor_id))
    donor = result.scalar_one_or_none()
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )
    return donor

@router.put("/{donor_id}", response_model=DonorSchema, status_code=status.HTTP_200_OK)
async def update_donor(donor_id: str, payload: DonorUpdate, db: AsyncSession = Depends(get_db)):
    """Update a donor."""
    result = await db.execute(select(Donor).where(Donor.id == donor_id))
    donor = result.scalar_one_or_none()
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(donor, key, value)
    db.add(donor)
    await db.commit()
    await db.refresh(donor)
    return donor

@router.delete("/{donor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donor(donor_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a donor."""
    result = await db.execute(select(Donor).where(Donor.id == donor_id))
    donor = result.scalar_one_or_none()
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found",
        )
    await db.delete(donor)
    await db.commit()


