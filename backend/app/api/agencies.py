"""Agencies REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Agency
from ..schemas import Agency as AgencySchema
from ..schemas import AgencyCreate, AgencyUpdate
from ..services import agencies_service

router = APIRouter()


async def get_agency_or_404(
    agency_id: str, db: AsyncSession = Depends(get_db)
) -> Agency:
    agency = await agencies_service.get_agency(db, agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agency not found"
        )
    return agency


@router.get("", response_model=list[AgencySchema])
async def list_agencies(db: AsyncSession = Depends(get_db)):
    return await agencies_service.list_agencies(db)


@router.post("", response_model=AgencySchema, status_code=status.HTTP_201_CREATED)
async def create_agency(payload: AgencyCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await agencies_service.create_agency(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{agency_id}", response_model=AgencySchema)
async def get_agency(agency: Agency = Depends(get_agency_or_404)):
    return agency


@router.put("/{agency_id}", response_model=AgencySchema)
async def update_agency(
    payload: AgencyUpdate,
    agency: Agency = Depends(get_agency_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await agencies_service.update_agency(db, agency, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{agency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agency(
    agency: Agency = Depends(get_agency_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await agencies_service.delete_agency(db, agency)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
