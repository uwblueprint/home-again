from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Client
from ..models import Agency 
from ..schemas import ClientCreate, ClientUpdate

async def list_clients(db: AsyncSession) -> list[Client]:
    """Return all clients ordered by last and first name."""
    result = await db.execute(select(Client).order_by(Client.last_name, Client.first_name))
    return list(result.scalars().all())


async def get_client(db: AsyncSession, client_id: str) -> Client | None:
    """Return a single client by ID or None when not found."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    return result.scalar_one_or_none()


async def create_client(db: AsyncSession, payload: ClientCreate) -> Client:
    data = payload.model_dump(exclude_unset=True)
    # UNCOMMENT WHEN AGENCIES ARE IMPLEMENTED FOR AGENCY VALIDATION
    """
    if "agency_id" in data:
        agency_check = await db.execute(select(Agency).where(Agency.id == data["agency_id"]))
        if not agency_check.scalar_one_or_none():
            raise ValueError(f"Agency with ID '{data['agency_id']}' does not exist.")
    """

    for key, value in data.items():
        if isinstance(value, datetime) and value.tzinfo is not None:
            data[key] = value.replace(tzinfo=None)
    
    db_client = Client(**data)
    db.add(db_client)
    
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError("Unable to create client: Data integrity violation.") from e

    await db.refresh(db_client)
    return db_client


async def update_client(db: AsyncSession, client: Client, payload: ClientUpdate) -> Client:
    """Update a client, normalizing datetimes and handling partial payloads."""
    data = payload.model_dump(exclude_unset=True)
    
    if not data:
        return client

    for key, value in data.items():
        if isinstance(value, datetime) and value.tzinfo is not None:
            value = value.astimezone(timezone.utc).replace(tzinfo=None)
        setattr(client, key, value)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError("Update failed: Data integrity violation") from e

    await db.refresh(client)
    return client


async def delete_client(db: AsyncSession, client: Client) -> None:
    """Delete an existing client."""
    await db.delete(client)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError("Unable to delete client: Data integrity violation") from e
