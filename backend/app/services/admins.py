"""Admin service layer.

Handles database operations for Admins.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Admin
from ..schemas import AdminCreate, AdminUpdate


async def list_admins(db: AsyncSession):
    """Return all admins ordered by first name."""
    result = await db.execute(select(Admin).order_by(Admin.first_name))
    return list(result.scalars().all())


async def create_admin(db: AsyncSession, payload: AdminCreate):
    """Create a new admin."""
    db_admin = Admin(**payload.model_dump())
    db.add(db_admin)
    await db.commit()
    await db.refresh(db_admin)
    return db_admin


async def get_admin(db: AsyncSession, admin_id: str):
    """Return a single admin by ID or None."""
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    return result.scalar_one_or_none()


async def update_admin(db: AsyncSession, admin: Admin, payload: AdminUpdate):
    """Update an admin."""
    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(admin, key, value)

    await db.commit()
    await db.refresh(admin)
    return admin


async def delete_admin(db: AsyncSession, admin: Admin):
    """Delete an admin."""
    await db.delete(admin)
    await db.commit()
