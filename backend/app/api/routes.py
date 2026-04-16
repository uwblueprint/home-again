"""Routes REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Route
from ..schemas import Route as RouteSchema
from ..schemas import RouteCreate, RouteUpdate
from ..services import route_service

router = APIRouter()


async def get_route_or_404(
    route_id: str, db: AsyncSession = Depends(get_db)
) -> Route:
    route = await route_service.get_route(db, route_id)
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Route not found"
        )
    return route


@router.get("", response_model=list[RouteSchema])
async def list_routes(db: AsyncSession = Depends(get_db)):
    return await route_service.list_routes(db)


@router.post("", response_model=RouteSchema, status_code=status.HTTP_201_CREATED)
async def create_route(payload: RouteCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await route_service.create_route(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{route_id}", response_model=RouteSchema)
async def get_route(route: Route = Depends(get_route_or_404)):
    return route


@router.put("/{route_id}", response_model=RouteSchema)
async def update_route(
    payload: RouteUpdate,
    route: Route = Depends(get_route_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await route_service.update_route(db, route, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(
    route: Route = Depends(get_route_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await route_service.delete_route(db, route)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
