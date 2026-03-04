"""Agents REST API.

Full CRUD for agents resource.
Mirrors agency.py.
Agents belong to agencies, so POST and PUT validate that the agency_id exists.
Endpoints for Agency agents (Supabase Auth; link via supabase_user_id).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
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
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail = f"Agent with agent ID '{agent_id}' not found",
        )
    return agent

async def validate_agency_exists(agency_id: str, db: AsyncSession) -> None:
    """
    Reusable helper: confirms agency_id refers to real agecny
    If not, raise a 404 error
    """
    result = await db.execute(select(Agency).where(Agency.id == agency_id))
    agency = result.scalar_one_or_none()
    if not agency:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"Agency with agency ID '{agency_id}' not found. Cannot assign agent to non-existent agency."
        )

# Endpoints

@router.get("", response_model = list[AgentSchema])
async def list_agents(db: AsyncSession = Depends(get_db)):
    """
    GET /api/agents
    Returns list of all agents, ordered by last name, first name
    """
    result = await db.execute(
        select(Agent).order_by(Agent.last_name, Agent.first_name)
    )
    return list(result.scalars().all())

@router.post("", response_model = AgentSchema, status_code = status.HTTP_201_CREATED)
async def create_agent(agent: AgentCreate, db: AsyncSession = Depends(get_db)):
    """
    POST /api/agents
    Creates a new agent
    
    Validates that the agency_id in the request body refers to a real agency before saving
    Returns 201 Created with the new agent on success
    """
    await validate_agency_exists(agent.agency_id, db)

    db_agent = Agent(**agent.model_dump())
    
    db.add(db_agent)        
    await db.commit()
    await db.refresh(db_agent)
    return db_agent

@router.get("/{agent_id}", response_model = AgentSchema)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    """
    GET /api/agents/{agent_id}
    Returns a single agent by ID.
    Returns 404 if not found.
    """
    return await get_agent_or_404(agent_id, db)

@router.put("/{agent_id}", response_model=AgentSchema)
async def update_agent(
    agent_id: str,
    payload: AgentUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Updates existing agent.
    Validates agency_id if being changed.
    Returns 404 if agnecy doesn't exist.
    """
    agent = await get_agent_or_404(agent_id, db)
    data = payload.model_dump(exclude_unset=True)
    if "agency_id" in data:
        await validate_agency_exists(data["agency_id"], db)

    for key, value in data.items():
        setattr(agent, key, value)

    await db.commit()
    await db.refresh(agent)
    return agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    """
    Deletes an agent permanently.
    Returns 204 No Content on success.
    Returns 404 if the agent doesn't exist.
    """
    agent = await get_agent_or_404(agent_id, db)
    await db.delete(agent)
    await db.commit()
