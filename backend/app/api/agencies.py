"""Agencies REST API.

Full CRUD implementation for the Agencies resource.
Use this module as the reference pattern for other resources.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Agency
from ..schemas import Agency as AgencySchema
from ..schemas import AgencyCreate, AgencyUpdate

router = APIRouter()


@router.get("", response_model=list[AgencySchema])
async def list_agencies(db: AsyncSession = Depends(get_db)):
    """List all agencies."""
    result = await db.execute(select(Agency).order_by(Agency.name))
    return list(result.scalars().all())


@router.post("", response_model=AgencySchema, status_code=status.HTTP_201_CREATED)
async def create_agency(agency: AgencyCreate, db: AsyncSession = Depends(get_db)):
    """Create a new agency."""
    db_agency = Agency(**agency.model_dump())
    db.add(db_agency)
    await db.commit()
    await db.refresh(db_agency)
    return db_agency


@router.get("/{agency_id}", response_model=AgencySchema)
async def get_agency(agency_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single agency by ID."""
    result = await db.execute(select(Agency).where(Agency.id == agency_id))
    agency = result.scalar_one_or_none()
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency not found",
        )
    return agency


@router.put("/{agency_id}", response_model=AgencySchema)
async def update_agency(
    agency_id: str,
    payload: AgencyUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an agency."""
    result = await db.execute(select(Agency).where(Agency.id == agency_id))
    agency = result.scalar_one_or_none()
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency not found",
        )
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(agency, key, value)
    await db.commit()
    await db.refresh(agency)
    return agency


@router.delete("/{agency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agency(agency_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an agency."""
    result = await db.execute(select(Agency).where(Agency.id == agency_id))
    agency = result.scalar_one_or_none()
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency not found",
        )
    await db.delete(agency)
    await db.commit()
