"""Routes REST API.

Full CRUD implementation for the Routes resource.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import Route as RouteSchema
from ..schemas import RouteCreate, RouteUpdate
from ..services import route_service

router = APIRouter()


@router.get("", response_model=list[RouteSchema])
async def list_routes(db: AsyncSession = Depends(get_db)):
    """List all routes."""
    return await route_service.list_routes(db)


@router.post("", response_model=RouteSchema, status_code=status.HTTP_201_CREATED)
async def create_route(payload: RouteCreate, db: AsyncSession = Depends(get_db)):
    """Create a new route."""
    try:
        return await route_service.create_route(db, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.get("/{route_id}", response_model=RouteSchema)
async def get_route(route_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single route by ID."""
    route = await route_service.get_route(db, route_id)
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found",
        )
    return route


@router.put("/{route_id}", response_model=RouteSchema)
async def update_route(
    route_id: str,
    payload: RouteUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a route."""
    route = await route_service.get_route(db, route_id)
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found",
        )

    try:
        return await route_service.update_route(db, route, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(route_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a route."""
    route = await route_service.get_route(db, route_id)
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found",
        )

    try:
        await route_service.delete_route(db, route)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return Response(status_code=status.HTTP_204_NO_CONTENT)
