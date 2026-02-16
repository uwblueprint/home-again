"""Starter endpoints for the Donors API.

This module contains a minimal placeholder to extend and implement.
Refer to `backend/python/STARTER_BACKEND_GUIDE.md` for implementation
examples and guidance on using `AsyncSession`, models, and schemas.
"""

from fastapi import APIRouter, Response, status

router = APIRouter()


@router.get("")
async def list_donors():
    """List donors.

    Placeholder implementation. See `backend/python/STARTER_BACKEND_GUIDE.md`
    for details on implementing this handler.
    """
    return Response(
        content="Not implemented — see backend/python/STARTER_BACKEND_GUIDE.md",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
    )
