"""Admins REST API.

Endpoints for Admin users (Supabase Auth; link via supabase_user_id).
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Admin
from ..schemas import Admin as AdminSchema
from ..schemas import AdminCreate, AdminUpdate
from ..services import admins

router = APIRouter()

# Helper

async def get_admin_or_404(admin_id: str, db: AsyncSession) -> Admin:
    """
    Reusable helper: looks up admin by ID
    If not found, raise a 404 immediately
    """
    admin = await admins.get_admin(db, admin_id)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )

    return admin


# Endpoints


@router.get("", response_model=list[AdminSchema])
async def list_admins(db: AsyncSession = Depends(get_db)):
    """List all admins."""
    return await admins.list_admins(db)


@router.post(
    "",
    response_model=AdminSchema,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"description": "Integrity error"}},
)
async def create_admin(
    payload: AdminCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin."""
    try:
        return await admins.create_admin(db, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get("/{admin_id}", response_model=AdminSchema)
async def get_admin(
    admin_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single admin."""
    return await get_admin_or_404(admin_id, db)


@router.put(
    "/{admin_id}",
    response_model=AdminSchema,
    responses={
        400: {"description": "Integrity error"},
        404: {"description": "Admin not found"},
    },
)
async def update_admin(
    admin_id: str,
    payload: AdminUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an admin."""
    admin = await get_admin_or_404(admin_id, db)

    try:
        return await admins.update_admin(db, admin, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete(
    "/{admin_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        400: {"description": "Integrity error"},
        404: {"description": "Admin not found"},
    },
)
async def delete_admin(
    admin_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete an admin."""
    admin = await get_admin_or_404(admin_id, db)

    try:
        await admins.delete_admin(db, admin)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return Response(status_code=status.HTTP_204_NO_CONTENT)
