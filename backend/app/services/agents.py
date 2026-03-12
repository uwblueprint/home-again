"""Agents service."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Agency, Agent
from ..schemas import AgentCreate, AgentUpdate


async def validate_agency_exists(agency_id: str, db: AsyncSession) -> bool:
    """
    Return True if the agency exists, False otherwise.
    """
    result = await db.execute(select(Agency).where(Agency.id == agency_id))
    return result.scalar_one_or_none() is not None


async def list_agents(db: AsyncSession) -> list[Agent]:
    """
    Return all agents ordered by last name, first name.
    """
    result = await db.execute(select(Agent).order_by(Agent.last_name, Agent.first_name))
    return result.scalars().all()


async def get_agent(agent_id: str, db: AsyncSession) -> Agent | None:
    """
    Return an agent by id, or None if not found.
    """
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    return result.scalar_one_or_none()


async def create_agent(payload: AgentCreate, db: AsyncSession) -> Agent:
    """
    Create and return a new agent.
    """
    db_agent = Agent(**payload.model_dump())
    db.add(db_agent)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to create agent: {str(e.orig)}") from e
    await db.refresh(db_agent)
    return db_agent


async def update_agent(
    agent: Agent,
    payload: AgentUpdate,
    db: AsyncSession,
) -> Agent:
    """
    Update and return an existing agent.
    """
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agent, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to update agent: {str(e.orig)}") from e
    await db.refresh(agent)
    return agent


async def delete_agent(agent: Agent, db: AsyncSession) -> None:
    """
    Delete an agent permanently.
    """
    await db.delete(agent)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to delete agent: {str(e.orig)}") from e
