"""
Supabase JWT authentication dependency.

Verifies Bearer tokens locally against Supabase's public JWKS. The JWKS
client is created lazily and cached so the app can start with an empty
SUPABASE_JWKS_URL, and so keys are not re-fetched on every request.
"""

from dataclasses import dataclass
from functools import lru_cache
from uuid import UUID

import jwt
from fastapi import Depends, Header, HTTPException
from jwt import PyJWKClient

from .config import get_settings


@dataclass
class CurrentUser:
    """Authenticated caller extracted from a verified Supabase JWT."""

    id: UUID
    email: str | None


@lru_cache
def get_jwks_client() -> PyJWKClient:
    """Shared PyJWKClient; created on first use so unset URL does not break import."""
    settings = get_settings()
    return PyJWKClient(settings.SUPABASE_JWKS_URL)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    authorization: str | None = Header(None),
    jwks_client: PyJWKClient = Depends(get_jwks_client),
) -> CurrentUser:
    """
    FastAPI dependency: verify a Supabase access token and return the user.

    Plain ``def`` (not async) so FastAPI runs blocking JWKS fetches in a
    threadpool. Override ``get_jwks_client`` in tests to supply a fake key source.
    """
    if not authorization:
        raise _unauthorized("Missing bearer token")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise _unauthorized("Malformed authorization header")

    settings = get_settings()
    try:
        key = jwks_client.get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            key,
            algorithms=["ES256"],
            audience=settings.SUPABASE_JWT_AUDIENCE,
        )
        return CurrentUser(id=UUID(claims["sub"]), email=claims.get("email"))
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise _unauthorized("Invalid token") from exc
