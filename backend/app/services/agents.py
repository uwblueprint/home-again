"""Agent service layer."""

import logging

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Agency, Agent
from ..schemas import AgentCreate, AgentUpdate

logger = logging.getLogger(__name__)


class AgentEmailTaken(ValueError):
    """Another agent already has this email (ignoring case)."""

    def __init__(self) -> None:
        super().__init__("An agent with this email already exists.")


async def email_taken(
    db: AsyncSession, email: str, exclude_id: str | None = None
) -> bool:
    query = select(Agent.id).where(func.lower(Agent.email) == func.lower(email))
    if exclude_id:
        query = query.where(Agent.id != exclude_id)
    return (await db.execute(query)).first() is not None


async def list_agents(db: AsyncSession) -> list[Agent]:
    result = await db.execute(select(Agent).order_by(Agent.last_name, Agent.first_name))
    return result.scalars().all()


async def get_agent(db: AsyncSession, agent_id: str) -> Agent | None:
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    return result.scalar_one_or_none()


async def create_agent(db: AsyncSession, payload: AgentCreate) -> Agent:
    # agency_id is optional (a main contact before intake), but must exist if set
    if payload.agency_id is not None:
        result = await db.execute(
            select(Agency.id).where(Agency.id == payload.agency_id)
        )
        if not result.scalar_one_or_none():
            raise ValueError(f"Agency with ID '{payload.agency_id}' does not exist.")
    if await email_taken(db, payload.email):
        raise AgentEmailTaken()
    db_agent = Agent(**payload.model_dump())
    db.add(db_agent)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        # Another request may have added the same email since the check above.
        if await email_taken(db, payload.email):
            raise AgentEmailTaken() from e
        logger.exception("IntegrityError creating agent: %s", e.orig)
        raise ValueError(f"Unable to create agent: {str(e.orig)}") from e
    await db.refresh(db_agent)
    return db_agent


async def update_agent(db: AsyncSession, agent: Agent, payload: AgentUpdate) -> Agent:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    if "agency_id" in data and data["agency_id"]:
        result = await db.execute(
            select(Agency.id).where(Agency.id == data["agency_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(f"Agency with ID '{data['agency_id']}' does not exist.")
    # Read before the commit: after a rollback the instance is expired.
    agent_id = agent.id
    new_email = data.get("email")
    if new_email and await email_taken(db, new_email, exclude_id=agent_id):
        raise AgentEmailTaken()
    for key, value in data.items():
        setattr(agent, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        if new_email and await email_taken(db, new_email, exclude_id=agent_id):
            raise AgentEmailTaken() from e
        logger.exception("IntegrityError updating agent %s: %s", agent_id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(agent)
    return agent


async def delete_agent(db: AsyncSession, agent: Agent) -> None:
    await db.delete(agent)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting agent %s: %s", agent.id, e.orig)
        raise ValueError(f"Unable to delete agent: {str(e.orig)}") from e
