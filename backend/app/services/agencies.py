"""Agency service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Agency, Agent
from ..schemas import AgencyCreate, AgencyUpdate

logger = logging.getLogger(__name__)


async def list_agencies(db: AsyncSession) -> list[Agency]:
    result = await db.execute(select(Agency).order_by(Agency.name))
    return result.scalars().all()


async def get_agency(db: AsyncSession, agency_id: str) -> Agency | None:
    result = await db.execute(select(Agency).where(Agency.id == agency_id))
    return result.scalar_one_or_none()


async def create_agency(db: AsyncSession, payload: AgencyCreate) -> Agency:
    db_agency = Agency(**payload.model_dump())
    db.add(db_agency)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating agency: %s", e.orig)
        raise ValueError(f"Unable to create agency: {str(e.orig)}") from e
    await db.refresh(db_agency)
    return db_agency


async def update_agency(db: AsyncSession, agency: Agency, payload: AgencyUpdate) -> Agency:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    for key, value in data.items():
        setattr(agency, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating agency %s: %s", agency.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(agency)
    return agency


async def delete_agency(db: AsyncSession, agency: Agency) -> None:
    result = await db.execute(select(Agent.id).where(Agent.agency_id == agency.id))
    if result.first() is not None:
        raise ValueError("Cannot delete agency: it still has assigned agents.")
    await db.delete(agency)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting agency %s: %s", agency.id, e.orig)
        raise ValueError(f"Unable to delete agency: {str(e.orig)}") from e
