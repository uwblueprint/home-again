"""Database-backed role checks for authenticated users."""

from fastapi import Depends, HTTPException, status
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


async def require_agency_admin(
    agency_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Agent:
    """Allow only admin agents belonging to the agency being accessed."""
    result = await db.execute(
        select(Agent).where(
            Agent.supabase_user_id == str(user.id),
            Agent.is_admin.is_(True),
            Agent.agency_id == agency_id,
        )
    )
    agent = result.scalar_one_or_none()
    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Agency admin access required"
        )
    return agent
