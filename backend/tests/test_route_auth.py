"""
Ensure every non-public route requires login.

Edit PUBLIC_ROUTES deliberately when adding an anonymous endpoint — that
visible allowlist change is the point of this test.
"""

import re
from uuid import uuid4

import pytest
from fastapi.routing import APIRoute

# Hand-written allowlist. Edit this when adding an anonymous endpoint.
# Doc routes only exist when settings.DEBUG is True.
PUBLIC_ROUTES: set[tuple[str, str]] = {
    ("GET", "/health"),
    ("GET", "/docs"),
    ("GET", "/docs/oauth2-redirect"),
    ("GET", "/redoc"),
    ("GET", "/openapi.json"),
}


def _fill_path_params(path: str) -> str:
    """Replace {param} segments with dummy UUIDs so the request is well-formed."""
    return re.sub(r"\{[^}]+\}", str(uuid4()), path)


def _iter_http_routes(app):
    for route in app.routes:
        if not isinstance(route, APIRoute):
            continue
        for method in route.methods - {"HEAD", "OPTIONS"}:
            yield method, route.path


@pytest.mark.asyncio
async def test_non_public_routes_require_auth(unauthenticated_client):
    client, app = unauthenticated_client

    checked = 0
    for method, path in _iter_http_routes(app):
        if (method, path) in PUBLIC_ROUTES:
            continue

        url = _fill_path_params(path)
        response = await client.request(method, url)
        assert (
            response.status_code == 401
        ), f"{method} {path} should require login, got {response.status_code}"
        checked += 1

    assert checked > 0, "Expected at least one protected route"


@pytest.mark.asyncio
async def test_public_health_allows_anonymous(unauthenticated_client):
    client, _app = unauthenticated_client
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
