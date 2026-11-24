"""Database-backed role checks for authenticated users."""

from fastapi import Depends, HTTPException, Path, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import CurrentUser, get_current_user
from .database import get_db
from .models import Admin, Agent


async def require_staff(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Admin:
    """Allow only HAFB staff with an Admin row linked to their Auth user ID."""
    result = await db.execute(
        select(Admin).where(Admin.supabase_user_id == str(user.id))
    )
    admin = result.scalar_one_or_none()
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required"
        )
    return admin


async def _get_agency_agent(
    agency_id: str,
    user: CurrentUser,
    db: AsyncSession,
    *,
    admin_only: bool,
) -> Agent:
    """Return the caller's Agent row for the agency, or raise 403."""
    query = select(Agent).where(
        Agent.supabase_user_id == str(user.id),
        Agent.agency_id == agency_id,
    )
    if admin_only:
        query = query.where(Agent.is_admin.is_(True))
    agent = (await db.execute(query)).scalar_one_or_none()
    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agency admin access required"
            if admin_only
            else "Agency access required",
        )
    return agent


# agency_id uses Path(...) so it is only ever read from the URL path. Without
# it, routes lacking {agency_id} would read it from the query string, letting
# a caller name whichever agency they belong to.
async def require_agency_member(
    agency_id: str = Path(...),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Agent:
    """Allow any agent (admin or not) belonging to the agency being accessed."""
    return await _get_agency_agent(agency_id, user, db, admin_only=False)


async def require_agency_admin(
    agency_id: str = Path(...),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Agent:
    """Allow only admin agents belonging to the agency being accessed."""
    return await _get_agency_agent(agency_id, user, db, admin_only=True)
