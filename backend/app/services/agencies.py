"""Agency services module.

Contains business logic for agency-related operations.
"""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from ..models import Agency
from ..schemas import AgencyCreate, AgencyUpdate


async def list_agencies(db: AsyncSession) -> list[Agency]:
    """List all agencies ordered by name."""
    result = await db.execute(select(Agency).order_by(Agency.name))
    return list(result.scalars().all())


async def get_agency(db: AsyncSession, agency_id: str) -> Agency | None:
    """Get a single agency by ID, or None when not found."""
    result = await db.execute(select(Agency).where(Agency.id == agency_id))
    return result.scalar_one_or_none()


async def create_agency(db: AsyncSession, payload: AgencyCreate) -> Agency:
    """Create a new agency."""
    db_agency = Agency(**payload.model_dump())
    db.add(db_agency)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating agency: %s", e.orig)
        raise ValueError("Unable to create agency due to a data conflict.") from e
    await db.refresh(db_agency)
    return db_agency


async def update_agency(
    db: AsyncSession, agency: Agency, payload: AgencyUpdate
) -> Agency:
    """Update an existing agency."""
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
        raise ValueError("Update failed due to a data conflict.") from e
    await db.refresh(agency)
    return agency


async def delete_agency(db: AsyncSession, agency: Agency) -> None:
    """Delete an existing agency."""
    await db.delete(agency)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting agency %s: %s", agency.id, e.orig)
        raise ValueError("Unable to delete agency due to a data conflict.") from e
