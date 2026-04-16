"""Admins REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Admin
from ..schemas import Admin as AdminSchema
from ..schemas import AdminCreate, AdminUpdate
from ..services import admin_service

router = APIRouter()


async def get_admin_or_404(admin_id: str, db: AsyncSession = Depends(get_db)) -> Admin:
    admin = await admin_service.get_admin(db, admin_id)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return admin


@router.get("", response_model=list[AdminSchema])
async def list_admins(db: AsyncSession = Depends(get_db)):
    return await admin_service.list_admins(db)


@router.post("", response_model=AdminSchema, status_code=status.HTTP_201_CREATED)
async def create_admin(payload: AdminCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await admin_service.create_admin(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{admin_id}", response_model=AdminSchema)
async def get_admin(admin: Admin = Depends(get_admin_or_404)):
    return admin


@router.put("/{admin_id}", response_model=AdminSchema)
async def update_admin(
    payload: AdminUpdate,
    admin: Admin = Depends(get_admin_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await admin_service.update_admin(db, admin, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin: Admin = Depends(get_admin_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await admin_service.delete_admin(db, admin)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
