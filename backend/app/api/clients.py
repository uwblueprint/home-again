"""Clients REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Client
from ..schemas import Client as ClientSchema
from ..schemas import ClientCreate, ClientUpdate
from ..services import clients_service

router = APIRouter()


async def get_client_or_404(
    client_id: str, db: AsyncSession = Depends(get_db)
) -> Client:
    client = await clients_service.get_client(db, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )
    return client


@router.get("", response_model=list[ClientSchema])
async def list_clients(db: AsyncSession = Depends(get_db)):
    return await clients_service.list_clients(db)


@router.post("", response_model=ClientSchema, status_code=status.HTTP_201_CREATED)
async def create_client(payload: ClientCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await clients_service.create_client(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{client_id}", response_model=ClientSchema)
async def get_client(client: Client = Depends(get_client_or_404)):
    return client


@router.put("/{client_id}", response_model=ClientSchema)
async def update_client(
    payload: ClientUpdate,
    client: Client = Depends(get_client_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await clients_service.update_client(db, client, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client: Client = Depends(get_client_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await clients_service.delete_client(db, client)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
