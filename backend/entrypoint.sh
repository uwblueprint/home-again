#!/usr/bin/env bash
set -e

cd /app
# Run migrations (alembic.ini in /app; script_location = migrations)
alembic upgrade head
# Start the API server
exec python server.py
