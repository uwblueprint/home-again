"""Admins REST API.

Endpoints for Admin users (Supabase Auth; link via supabase_user_id).
"""

from fastapi import APIRouter, Response, status

router = APIRouter()


@router.get("")
async def list_admins():
    """List admins. Placeholder — implement with Admin model and schemas."""
    return Response(
        content="Not implemented — see docs/STARTER_BACKEND_GUIDE.md",
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
    )
