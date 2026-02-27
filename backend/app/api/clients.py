"""Clients REST API."""

from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import Client as ClientSchema
from ..schemas import ClientCreate, ClientUpdate
from ..services import clients_service

router = APIRouter()


async def get_current_user(authorization: str | None = Header(default=None)) -> Any:
    """Placeholder auth dependency.

    Returns 401 when no bearer token is provided.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return {"token": authorization}


@router.get("", response_model=list[ClientSchema], status_code=status.HTTP_200_OK)
async def list_clients(
    db: AsyncSession = Depends(get_db),
    _: Any = Depends(get_current_user),
):
    return await clients_service.list_clients(db)


@router.post("", response_model=ClientSchema, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    db: AsyncSession = Depends(get_db),
    _: Any = Depends(get_current_user),
):
    try:
        return await clients_service.create_client(db, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get("/{id}", response_model=ClientSchema, status_code=status.HTTP_200_OK)
async def get_client(
    id: str,
    db: AsyncSession = Depends(get_db),
    _: Any = Depends(get_current_user),
):
    client = await clients_service.get_client_by_id(db, id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    return client


@router.put("/{id}", response_model=ClientSchema, status_code=status.HTTP_200_OK)
async def update_client(
    id: str,
    payload: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    _: Any = Depends(get_current_user),
):
    client = await clients_service.get_client_by_id(db, id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    try:
        return await clients_service.update_client(db, client, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    id: str,
    db: AsyncSession = Depends(get_db),
    _: Any = Depends(get_current_user),
):
    client = await clients_service.get_client_by_id(db, id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    try:
        await clients_service.delete_client(db, client)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return Response(status_code=status.HTTP_204_NO_CONTENT)
