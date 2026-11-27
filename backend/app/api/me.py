"""Current-user endpoint: who is signed in, so the frontend can route them."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import CurrentUser, get_current_user
from ..database import get_db
from ..models import Admin, Agent
from ..schemas import Me

router = APIRouter()

NO_ACCOUNT_DETAIL = (
    "No Home Again account is linked to this login. "
    "Contact Home Again Furniture Bank for access."
)


@router.get("", response_model=Me)
async def get_me(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Me:
    """Return the caller's role and profile from their admins or agents row."""
    user_id = str(user.id)

    admin = (
        await db.execute(select(Admin).where(Admin.supabase_user_id == user_id))
    ).scalar_one_or_none()
    if admin is not None:
        return Me(
            role="staff",
            id=admin.id,
            email=admin.email,
            first_name=admin.first_name,
            last_name=admin.last_name,
            agency_id=None,
            is_agency_admin=False,
            intake_complete=False,
        )

    agent = (
        await db.execute(select(Agent).where(Agent.supabase_user_id == user_id))
    ).scalar_one_or_none()
    if agent is not None:
        return Me(
            role="agent",
            id=agent.id,
            email=agent.email,
            first_name=agent.first_name,
            last_name=agent.last_name,
            agency_id=agent.agency_id,
            is_agency_admin=agent.is_admin,
            intake_complete=agent.agency_id is not None,
        )

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=NO_ACCOUNT_DETAIL)
