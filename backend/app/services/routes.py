"""Route service layer."""

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Route
from ..schemas import RouteCreate, RouteUpdate

logger = logging.getLogger(__name__)


async def list_routes(db: AsyncSession) -> list[Route]:
    result = await db.execute(select(Route).order_by(Route.date))
    return result.scalars().all()


async def get_route(db: AsyncSession, route_id: str) -> Route | None:
    result = await db.execute(select(Route).where(Route.id == route_id))
    return result.scalar_one_or_none()


async def create_route(db: AsyncSession, payload: RouteCreate) -> Route:
    data = payload.model_dump()
    # SQLite (tests) has no timezone type — strip tzinfo so both backends agree
    for key, value in data.items():
        if isinstance(value, datetime) and value.tzinfo is not None:
            data[key] = value.astimezone(timezone.utc).replace(tzinfo=None)
    db_route = Route(**data)
    db.add(db_route)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating route: %s", e.orig)
        raise ValueError(f"Unable to create route: {str(e.orig)}") from e
    await db.refresh(db_route)
    return db_route


async def update_route(db: AsyncSession, route: Route, payload: RouteUpdate) -> Route:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    for key, value in data.items():
        if isinstance(value, datetime) and value.tzinfo is not None:
            value = value.astimezone(timezone.utc).replace(tzinfo=None)
        setattr(route, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating route %s: %s", route.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(route)
    return route


async def delete_route(db: AsyncSession, route: Route) -> None:
    await db.delete(route)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting route %s: %s", route.id, e.orig)
        raise ValueError(f"Unable to delete route: {str(e.orig)}") from e
