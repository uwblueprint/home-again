"""Agents REST API.

Full CRUD for agents resource.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Agency, Agent
from ..schemas import AgentCreate, AgentUpdate, Agent as AgentSchema

router = APIRouter()

# Helpers


async def get_agent_or_404(agent_id: str, db: AsyncSession) -> Agent:
    """
    Reusable helper: looks up agent by ID
    If not found, raise a 404 immediately
    """
    agent = await agent_service.get_agent(agent_id, db)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with id '{agent_id}' not found.",
        )
    return agent

# Endpoints

@router.get("", response_model=list[AgentSchema])
async def list_agents(db: AsyncSession = Depends(get_db)):
    """
    GET /api/agents
    Returns list of all agents
    """
    return await agent_service.list_agents(db)

@router.post("", response_model=AgentSchema, status_code=status.HTTP_201_CREATED)
async def create_agent(agent: AgentCreate, db: AsyncSession = Depends(get_db)):
    """
    Creates a new agent.
    """
    if not await agent_service.validate_agency_exists(agent.agency_id, db):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agency with id '{agent.agency_id}' not found.",
        )
    return await agent_service.create_agent(agent, db)


@router.get("/{agent_id}", response_model=AgentSchema)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns a single agent.
    """
    return await get_agent_or_404(agent_id, db)


@router.put("/{agent_id}", response_model=AgentSchema)
async def update_agent(
    agent_id: str,
    payload: AgentUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Updates an existing agent.
    """
    agent = await get_agent_or_404(agent_id, db)
    if "agency_id" in payload.model_dump(exclude_unset=True):
        if not await agent_service.validate_agency_exists(payload.agency_id, db):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agency with id '{payload.agency_id}' not found.",
            )
    return await agent_service.update_agent(agent, payload, db)

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    """
    Deletes an agent.
    """
    agent = await get_agent_or_404(agent_id, db)
    await agent_service.delete_agent(agent, db)
