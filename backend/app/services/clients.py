"""Client service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Agency, Client
from ..schemas import ClientCreate, ClientUpdate

logger = logging.getLogger(__name__)


async def list_clients(db: AsyncSession) -> list[Client]:
    result = await db.execute(select(Client).order_by(Client.last_name, Client.first_name))
    return result.scalars().all()


async def get_client(db: AsyncSession, client_id: str) -> Client | None:
    result = await db.execute(select(Client).where(Client.id == client_id))
    return result.scalar_one_or_none()


async def create_client(db: AsyncSession, payload: ClientCreate) -> Client:
    data = payload.model_dump()
    await _validate_agency(db, data.get("agency_id"))
    db_client = Client(**data)
    db.add(db_client)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating client: %s", e.orig)
        raise ValueError(f"Unable to create client: {str(e.orig)}") from e
    await db.refresh(db_client)
    return db_client


async def update_client(db: AsyncSession, client: Client, payload: ClientUpdate) -> Client:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    if "agency_id" in data:
        await _validate_agency(db, data["agency_id"])
    for key, value in data.items():
        setattr(client, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating client %s: %s", client.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(client)
    return client


async def delete_client(db: AsyncSession, client: Client) -> None:
    await db.delete(client)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting client %s: %s", client.id, e.orig)
        raise ValueError(f"Unable to delete client: {str(e.orig)}") from e


async def _validate_agency(db: AsyncSession, agency_id: str | None) -> None:
    """Raise ValueError if agency_id is provided but does not exist."""
    if not agency_id:
        return
    result = await db.execute(select(Agency.id).where(Agency.id == agency_id))
    if not result.scalar_one_or_none():
        raise ValueError(f"Agency with ID '{agency_id}' does not exist.")
