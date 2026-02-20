"""Starter endpoints for the Clients API.

This module contains a minimal placeholder for contributors to extend.
Refer to `docs/STARTER_BACKEND_GUIDE.md` for implementation
examples and guidance on using `AsyncSession`, models, and schemas.
"""

from fastapi import APIRouter, Response, status

router = APIRouter()


@router.get("")
async def list_clients():
    """List clients.

    Placeholder implementation. See `docs/STARTER_BACKEND_GUIDE.md` (repo root)
    for details on implementing this handler.
    """
    return Response(
        content="Not implemented — see docs/STARTER_BACKEND_GUIDE.md",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
    )
