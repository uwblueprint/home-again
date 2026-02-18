"""Furniture REST API.

Endpoints for the Furniture resource.
"""

from fastapi import APIRouter, Response, status

router = APIRouter()


@router.get("")
async def list_furniture():
    """List furniture items.

    Placeholder implementation. See `backend/STARTER_BACKEND_GUIDE.md`
    for details on implementing this handler with the Furniture model and schemas.
    """
    return Response(
        content="Not implemented — see backend/STARTER_BACKEND_GUIDE.md",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
    )
