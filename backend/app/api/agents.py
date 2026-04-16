"""Agents REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Agent
from ..schemas import Agent as AgentSchema
from ..schemas import AgentCreate, AgentUpdate
from ..services import agents_service

router = APIRouter()


async def get_agent_or_404(agent_id: str, db: AsyncSession = Depends(get_db)) -> Agent:
    agent = await agents_service.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )
    return agent


@router.get("", response_model=list[AgentSchema])
async def list_agents(db: AsyncSession = Depends(get_db)):
    return await agents_service.list_agents(db)


@router.post("", response_model=AgentSchema, status_code=status.HTTP_201_CREATED)
async def create_agent(payload: AgentCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await agents_service.create_agent(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{agent_id}", response_model=AgentSchema)
async def get_agent(agent: Agent = Depends(get_agent_or_404)):
    return agent


@router.put("/{agent_id}", response_model=AgentSchema)
async def update_agent(
    payload: AgentUpdate,
    agent: Agent = Depends(get_agent_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await agents_service.update_agent(db, agent, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent: Agent = Depends(get_agent_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await agents_service.delete_agent(db, agent)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
