# Docker

This project runs with Docker Compose: frontend (Next.js), backend (FastAPI), and PostgreSQL.

## Table of contents

- [Quick start](#quick-start)
- [Services](#services)
- [Behaviour](#behaviour)
- [Overriding configuration](#overriding-configuration)
- [Useful commands](#useful-commands)
- [Production](#production)

## Quick start

```bash
docker-compose up --build
```

- **App**: http://localhost:3000  
- **API**: http://localhost:8000  
- **API docs**: http://localhost:8000/docs  

## Services

| Service    | Container   | Port | Description |
|-----------|-------------|------|-------------|
| frontend  | hafb_frontend | 3000 | Next.js dev server (Turbopack) |
| py-backend| hafb_backend  | 8000 | FastAPI; runs migrations on startup |
| db        | hafb_db       | 5432 | PostgreSQL 15 |

## Behaviour

- **Database**: The `db` service creates database `hafb` with user `hafb_user` and the password set in the compose file. Scripts in `db-init/` run on first start (e.g. `create-multiple-dbs.sh` if you set `POSTGRES_MULTIPLE_DATABASES`).
- **Migrations**: The backend container runs `alembic upgrade head` in its entrypoint before starting the API, so tables are created automatically.
- **Backend health**: Backend has a healthcheck on `/health`; frontend starts only after backend is healthy.
- **Frontend**: The dev server runs with Turbopack and listens on `0.0.0.0`. `CHOKIDAR_USEPOLLING` and `WATCHPACK_POLLING` are set so file changes are detected with volume mounts. The app calls the API at `http://localhost:8000/api` (browser uses the host's port mapping).

## Overriding configuration

Default env vars are set in `docker-compose.yml`. To override:

1. Create `backend/.env` and/or `frontend/.env.local` with your values.
2. In `docker-compose.yml`, add back the `env_file` key under the service, for example:
   ```yaml
   py-backend:
     env_file:
       - ./backend/.env
   ```

Then run `docker-compose up --build` as usual.

## Useful commands

```bash
# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f
docker-compose logs -f py-backend

# Stop and remove containers (data volume is kept)
docker-compose down

# Re-run migrations manually
docker-compose exec py-backend alembic upgrade head

# Shell into backend container
docker-compose exec py-backend sh
```

## Production

This Compose file is aimed at local development (hot reload, dev servers). For production you would typically:

- Build the frontend with `npm run build` and serve it (e.g. with `npm run start` or a static server).
- Use a production ASGI server (e.g. Gunicorn + Uvicorn) for the backend.
- Rely on a managed database or external PostgreSQL and set `DATABASE_URL` accordingly.

See [ARCHITECTURE.md - Deployment](./ARCHITECTURE.md#deployment) for more.
