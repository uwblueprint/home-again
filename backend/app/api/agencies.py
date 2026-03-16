"""Agencies REST API.

Full CRUD implementation for the Agencies resource.
Use this module as the reference pattern for other resources.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
<<<<<<< HEAD
from ..models import Agency
from ..schemas import Agency as AgencySchema
from ..schemas import AgencyCreate, AgencyUpdate
=======
from ..services import agencies_service
from ..models import Agency, Agent
from ..schemas import AgencyCreate, AgencyUpdate, Agency as AgencySchema
>>>>>>> main

router = APIRouter()


@router.get("", response_model=list[AgencySchema])
async def list_agencies(db: AsyncSession = Depends(get_db)):
    """List all agencies."""
    return await agencies_service.list_agencies(db)


@router.post(
    "",
    response_model=AgencySchema,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"description": "Bad Request"}},
)
async def create_agency(agency: AgencyCreate, db: AsyncSession = Depends(get_db)):
    """Create a new agency."""
    if agency.main_agent_id:
        result = await db.execute(select(Agent).where(Agent.id == agency.main_agent_id))
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="main_agent_id does not exist",
            )
    db_agency = Agency(**agency.model_dump())
    db.add(db_agency)
    await db.commit()
    await db.refresh(db_agency)
    return db_agency


@router.get("/{agency_id}", response_model=AgencySchema)
async def get_agency(agency_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single agency by ID."""
    agency = await agencies_service.get_agency(db, agency_id)
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
    agency = await agencies_service.get_agency(db, agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency not found",
        )
    try:
        return await agencies_service.update_agency(db, agency, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{agency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agency(agency_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an agency."""
    agency = await agencies_service.get_agency(db, agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agency not found",
        )
    await agencies_service.delete_agency(db, agency)
