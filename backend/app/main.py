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
    # Startup
    print("Application starting up...")
    yield
    # Shutdown
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
