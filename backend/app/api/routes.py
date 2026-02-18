"""Routes REST API.

Endpoints for dispatch routes (pickup/dropoff furniture lists).
"""

from fastapi import APIRouter, Response, status

router = APIRouter()


@router.get("")
async def list_routes():
    """List routes. Placeholder — implement with Route model and schemas."""
    return Response(
        content="Not implemented — see backend/STARTER_BACKEND_GUIDE.md",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
    )
