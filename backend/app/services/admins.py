"""Admin service layer.

Handles database operations for Admins.
"""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Admin
from ..schemas import AdminCreate, AdminUpdate


async def list_admins(db: AsyncSession) -> list[Admin]:
    """Return all admins ordered by first name."""
    result = await db.execute(select(Admin).order_by(Admin.first_name))
    return result.scalars().all()


async def create_admin(db: AsyncSession, payload: AdminCreate) -> Admin:
    """Create a new admin."""
    try:
        db_admin = Admin(**payload.model_dump())
        db.add(db_admin)
        await db.commit()
        await db.refresh(db_admin)
        return db_admin
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to create admin: {str(e.orig)}") from e


async def get_admin(db: AsyncSession, admin_id: str) -> Admin | None:
    """Return a single admin by ID or None."""
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    return result.scalar_one_or_none()


async def update_admin(db: AsyncSession, admin: Admin, payload: AdminUpdate) -> Admin:
    """Update an admin."""
    try:
        data = payload.model_dump(exclude_unset=True)
        if not data:
            raise ValueError("No update fields were provided.")
        for key, value in data.items():
            setattr(admin, key, value)

        await db.commit()
        await db.refresh(admin)
        return admin
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to update admin: {str(e.orig)}") from e


async def delete_admin(db: AsyncSession, admin: Admin) -> None:
    """Delete an admin."""
    try:
        await db.delete(admin)
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to delete admin: {str(e.orig)}") from e
