from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Client
from ..schemas import ClientCreate, ClientUpdate


async def list_clients(db: AsyncSession) -> list[Client]:
    """Return all clients ordered by last and first name."""
    result = await db.execute(select(Client).order_by(Client.last_name, Client.first_name))
    return list(result.scalars().all())


async def get_client_by_id(db: AsyncSession, client_id: str) -> Client | None:
    """Return a single client by ID or None when not found."""
    result = await db.execute(select(Client).where(Client.id == client_id))
    return result.scalar_one_or_none()


async def create_client(db: AsyncSession, payload: ClientCreate) -> Client:
    """Create and persist a new client."""
    db_client = Client(**payload.model_dump())
    db.add(db_client)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError("Unable to create client due to data integrity constraints") from e

    await db.refresh(db_client)
    return db_client


async def update_client(db: AsyncSession, client: Client, payload: ClientUpdate) -> Client:
    """Update an existing client with partial payload support."""
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(client, key, value)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError("Unable to update client due to data integrity constraints") from e

    await db.refresh(client)
    return client


async def delete_client(db: AsyncSession, client: Client) -> None:
    """Delete an existing client."""
    await db.delete(client)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError("Unable to delete client due to data integrity constraints") from e
