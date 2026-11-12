"""
FastAPI application factory.

Initializes the FastAPI application with all middleware, routes, and
dependencies configured.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import public_router, router as api_router
from .config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    current = get_settings()
    if not current.DEBUG and not current.SUPABASE_JWKS_URL.strip():
        raise RuntimeError(
            "SUPABASE_JWKS_URL must be set when DEBUG is False "
            "(production deploys need JWKS to verify tokens)"
        )
    if current.is_development:
        if not current.DEBUG:
            raise RuntimeError(
                "ENV=DEVELOPMENT disables token checks and requires DEBUG=True; "
                "it must never be set in production"
            )
        print(
            "WARNING: ENV=DEVELOPMENT, requests without a bearer token act as "
            f"dev user {current.DEV_USER_ID}. Never use this in production."
        )

    print("Application starting up...")
    yield
    print("Application shutting down...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    # Docs/OpenAPI list every endpoint and schema. Keep them in DEBUG for
    # local/CI (e.g. openapi-typescript); disable in production.
    docs_enabled = settings.DEBUG

    app = FastAPI(
        title="Home Again Furniture Bank API",
        description="REST API for the Home Again Furniture Bank system",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs" if docs_enabled else None,
        redoc_url="/redoc" if docs_enabled else None,
        openapi_url="/openapi.json" if docs_enabled else None,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Protected CRUD API
    app.include_router(api_router, prefix="/api")

    # Public endpoints (no login)
    app.include_router(public_router)

    return app
