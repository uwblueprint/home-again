"""
Application configuration.

Environment-specific settings loaded from .env file.
Uses pydantic-settings for type-safe configuration.

@see https://docs.pydantic.dev/latest/api/config/
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # Environment. "DEVELOPMENT" lets requests without a bearer token act as
    # DEV_USER_ID (local dev only; see docs/ONBOARDING.md). Anything else,
    # including the default, requires a valid token on protected routes.
    ENV: str = "PRODUCTION"
    # Supabase user ID tokenless requests act as when ENV=DEVELOPMENT. Set it to
    # the supabase_user_id of a seeded admins/agents row to exercise role checks.
    DEV_USER_ID: str = "00000000-0000-0000-0000-000000000001"
    DEV_USER_EMAIL: str = "dev@example.com"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/hafb"

    # Supabase (optional, for auth if using Supabase)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    # Public JWKS endpoint used to verify access-token signatures.
    SUPABASE_JWKS_URL: str = ""
    # Expected "aud" claim in access tokens (Supabase uses "authenticated").
    SUPABASE_JWT_AUDIENCE: str = "authenticated"

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @property
    def is_development(self) -> bool:
        return self.ENV.strip().upper() == "DEVELOPMENT"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
