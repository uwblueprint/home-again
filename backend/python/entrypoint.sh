#!/usr/bin/env bash
set -e

cd /app
# Run migrations (config is in migrations/alembic.ini; DATABASE_URL from env via app.config)
alembic -c migrations/alembic.ini upgrade head
# Start the API server
exec python server.py
