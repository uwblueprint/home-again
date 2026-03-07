"""Admins REST API.

Endpoints for Admin users (Supabase Auth; link via supabase_user_id).
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import Admin as AdminSchema
from ..schemas import AdminCreate, AdminUpdate
from ..services import admins

router = APIRouter()


@router.get("", response_model=list[AdminSchema], status_code=status.HTTP_200_OK)
async def list_admins(db: AsyncSession = Depends(get_db)):
    """List all admins."""
    return await admins.list_admins(db)


@router.post("", response_model=AdminSchema, status_code=status.HTTP_201_CREATED)
async def create_admin(
    payload: AdminCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin."""
    return await admins.create_admin(db, payload)


@router.get("/{id}", response_model=AdminSchema, status_code=status.HTTP_200_OK)
async def get_admin(
    id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single admin."""
    admin = await admin.get_admin(db, id)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )

    return admin


@router.put("/{id}", response_model=AdminSchema, status_code=status.HTTP_200_OK)
async def update_admin(
    id: str,
    payload: AdminUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an admin."""
    admin = await admins.get_admin(db, id)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )

    return await admins.update_admin(db, admin, payload)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete an admin."""
    admin = await admins.get_admin(db, id)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )

    await admins.delete_admin(db, admin)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
