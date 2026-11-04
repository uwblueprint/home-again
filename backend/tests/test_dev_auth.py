"""Tests for the ENV=DEVELOPMENT tokenless-auth bypass."""

from uuid import UUID

import pytest
from fastapi import Depends
from httpx import ASGITransport, AsyncClient

from app.auth import CurrentUser, get_current_user
from app.config import get_settings
from app.main import create_app, lifespan

DEV_USER_ID = "11111111-2222-3333-4444-555555555555"


@pytest.fixture
def settings_env(monkeypatch):
    """Set env vars for one test and rebuild the cached Settings around it."""

    def apply(**values: str) -> None:
        for key, value in values.items():
            monkeypatch.setenv(key, value)
        get_settings.cache_clear()

    yield apply
    monkeypatch.undo()
    get_settings.cache_clear()


@pytest.fixture
async def me_client():
    app = create_app()

    @app.get("/_test/me")
    def me(user: CurrentUser = Depends(get_current_user)):
        return {"id": str(user.id), "email": user.email}

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest.mark.asyncio
async def test_development_without_token_returns_dev_user(settings_env, me_client):
    settings_env(ENV="DEVELOPMENT", DEV_USER_ID=DEV_USER_ID, DEV_USER_EMAIL="dev@x.org")

    response = await me_client.get("/_test/me")

    assert response.status_code == 200
    assert response.json() == {"id": DEV_USER_ID, "email": "dev@x.org"}


@pytest.mark.asyncio
async def test_development_env_value_is_case_insensitive(settings_env, me_client):
    settings_env(ENV="development")

    response = await me_client.get("/_test/me")

    assert response.status_code == 200
    assert UUID(response.json()["id"]) == UUID(get_settings().DEV_USER_ID)


@pytest.mark.asyncio
async def test_development_still_rejects_an_invalid_token(settings_env, me_client):
    settings_env(ENV="DEVELOPMENT")

    response = await me_client.get(
        "/_test/me", headers={"Authorization": "Bearer not-a-real-token"}
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_development_still_rejects_a_malformed_header(settings_env, me_client):
    settings_env(ENV="DEVELOPMENT")

    response = await me_client.get("/_test/me", headers={"Authorization": "Basic abc"})

    assert response.status_code == 401


@pytest.mark.asyncio
@pytest.mark.parametrize("env", ["PRODUCTION", "", "staging"])
async def test_other_envs_require_a_token(settings_env, me_client, env):
    settings_env(ENV=env)

    response = await me_client.get("/_test/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_startup_refuses_development_without_debug(settings_env):
    settings_env(ENV="DEVELOPMENT", DEBUG="False")

    with pytest.raises(RuntimeError, match="ENV=DEVELOPMENT"):
        async with lifespan(create_app()):
            pass


@pytest.mark.asyncio
async def test_startup_allows_development_with_debug(settings_env):
    settings_env(ENV="DEVELOPMENT", DEBUG="True")

    async with lifespan(create_app()):
        pass
