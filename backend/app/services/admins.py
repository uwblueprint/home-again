"""Admin service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Admin
from ..schemas import AdminCreate, AdminUpdate

logger = logging.getLogger(__name__)


async def list_admins(db: AsyncSession) -> list[Admin]:
    result = await db.execute(select(Admin).order_by(Admin.last_name, Admin.first_name))
    return result.scalars().all()


async def get_admin(db: AsyncSession, admin_id: str) -> Admin | None:
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    return result.scalar_one_or_none()


async def create_admin(db: AsyncSession, payload: AdminCreate) -> Admin:
    db_admin = Admin(**payload.model_dump())
    db.add(db_admin)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating admin: %s", e.orig)
        raise ValueError(f"Unable to create admin: {str(e.orig)}") from e
    await db.refresh(db_admin)
    return db_admin


async def update_admin(db: AsyncSession, admin: Admin, payload: AdminUpdate) -> Admin:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    for key, value in data.items():
        setattr(admin, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating admin %s: %s", admin.id, e.orig)
        raise ValueError(f"Unable to update admin: {str(e.orig)}") from e
    await db.refresh(admin)
    return admin


async def delete_admin(db: AsyncSession, admin: Admin) -> None:
    await db.delete(admin)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting admin %s: %s", admin.id, e.orig)
        raise ValueError(f"Unable to delete admin: {str(e.orig)}") from e
