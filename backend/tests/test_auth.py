"""Tests for Supabase JWT auth dependency (no real Supabase required)."""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import Depends
from httpx import ASGITransport, AsyncClient

from app.auth import CurrentUser, get_current_user, get_jwks_client
from app.config import get_settings
from app.main import create_app

AUDIENCE = "authenticated"
ALGORITHM = "ES256"


class FakeJWKSClient:
    """Minimal stand-in for PyJWKClient that returns a fixed public key."""

    def __init__(self, public_key):
        self._public_key = public_key

    def get_signing_key_from_jwt(self, _token: str):
        return SimpleNamespace(key=self._public_key)


@pytest.fixture(scope="module")
def key_pair():
    private_key = ec.generate_private_key(ec.SECP256R1())
    return private_key, private_key.public_key()


@pytest.fixture
def other_key_pair():
    private_key = ec.generate_private_key(ec.SECP256R1())
    return private_key, private_key.public_key()


def _make_token(
    private_key,
    *,
    sub: str | None = None,
    email: str = "agent@example.com",
    audience: str = AUDIENCE,
    expires_delta: timedelta = timedelta(hours=1),
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub or str(uuid4()),
        "email": email,
        "aud": audience,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, private_key, algorithm=ALGORITHM)


@pytest.fixture
async def auth_client(key_pair):
    _private_key, public_key = key_pair
    app = create_app()

    @app.get("/_test/me")
    def me(user: CurrentUser = Depends(get_current_user)):
        return {"id": str(user.id), "email": user.email}

    app.dependency_overrides[get_jwks_client] = lambda: FakeJWKSClient(public_key)

    # Ensure audience matches what tokens are signed with.
    get_settings.cache_clear()
    get_jwks_client.cache_clear()

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client, _private_key

    app.dependency_overrides.clear()
    get_jwks_client.cache_clear()


@pytest.mark.asyncio
async def test_missing_authorization_header_returns_401(auth_client):
    client, _ = auth_client
    response = await client.get("/_test/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Missing bearer token"
    assert response.headers.get("www-authenticate") == "Bearer"


@pytest.mark.asyncio
@pytest.mark.parametrize("header", ["Token abc", "Bearer", "bearer"])
async def test_malformed_authorization_header_returns_401(auth_client, header):
    client, _ = auth_client
    response = await client.get("/_test/me", headers={"Authorization": header})
    assert response.status_code == 401
    assert response.json()["detail"] == "Malformed authorization header"


@pytest.mark.asyncio
async def test_expired_token_returns_401(auth_client):
    client, private_key = auth_client
    token = _make_token(private_key, expires_delta=timedelta(hours=-1))
    response = await client.get(
        "/_test/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"


@pytest.mark.asyncio
async def test_wrong_audience_returns_401(auth_client):
    client, private_key = auth_client
    token = _make_token(private_key, audience="someone-else")
    response = await client.get(
        "/_test/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"


@pytest.mark.asyncio
async def test_bad_signature_returns_401(auth_client, other_key_pair):
    client, _ = auth_client
    other_private, _ = other_key_pair
    token = _make_token(other_private)
    response = await client.get(
        "/_test/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"


@pytest.mark.asyncio
async def test_valid_token_returns_current_user(auth_client):
    client, private_key = auth_client
    user_id = uuid4()
    email = "wanyun@example.com"
    token = _make_token(private_key, sub=str(user_id), email=email)

    response = await client.get(
        "/_test/me", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json() == {"id": str(user_id), "email": email}
