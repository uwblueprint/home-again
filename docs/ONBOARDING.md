# Developer Onboarding Guide

Get the local environment running, then start building.

## Prerequisites

- **Node.js 20+**: [Download](https://nodejs.org/)
- **Python 3.9+**: [Download](https://www.python.org/downloads/)
- **PostgreSQL 12+**: [Download](https://www.postgresql.org/download/)
- **Git**: [Download](https://git-scm.com/)
- **Docker + Compose**: Any runtime works — Docker Desktop, OrbStack, Colima, etc.

Verify:
```bash
node --version            # v20.0.0 or higher
python --version          # 3.9 or higher
git --version             # 2.0 or higher
docker --version          # 20.0 or higher
docker compose version    # v2.0 or higher
```

## Getting Started

### Option A: Docker (recommended)

```bash
cd home-again
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

The database is created and migrated automatically. See [DOCKER.md](./DOCKER.md) for details.

**Stopping:**
```bash
docker-compose down              # Stop and remove containers
docker-compose down -v           # Also remove database volume (full reset)
docker system prune -f           # Clean up unused images/layers (optional)
```

### Option B: Local install

#### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at http://localhost:3000. Stop with `Ctrl+C`.

#### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python3 server.py
```

Backend runs at http://localhost:8000. API docs at http://localhost:8000/docs. Stop with `Ctrl+C`.

**Environment variables**: The backend reads from `backend/.env`. See `docker-compose.yml` for the required variables and reference values — create `backend/.env` with those values for local development.

**Deactivating the venv when done:**
```bash
deactivate
```

#### 3. Database

```bash
createdb hafb
createdb hafb_test

cd backend
alembic upgrade head
```

## Quick Tour

Once everything is running:

1. Browse http://localhost:3000 — the frontend app
2. Browse http://localhost:8000/docs — interactive Swagger UI for all API endpoints
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and data flow
4. Read [SCHEMA.md](./SCHEMA.md) for the full entity reference (all 11 resources)
5. Trace one feature end-to-end: pick Agencies and follow model → schema → service → router → hook → page

## Project Guides

Each guide covers its domain in depth. Start with the one relevant to your first task:

| Guide | Covers |
|-------|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, tech stack decisions |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) | Service/router patterns, how to add a resource, testing |
| [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) | Directory structure, state management, types, conventions |
| [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) | Tokens, Tailwind utilities, shadcn components |
| [SCHEMA.md](./SCHEMA.md) | Entity reference (fields, types, relationships) |
| [DOCKER.md](./DOCKER.md) | Docker Compose setup |
| [GIT.md](./GIT.md) | Branch naming, commits, PRs |

## Commands Reference

### Frontend

```bash
cd frontend
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier
npm run type-check    # TypeScript check
npm test              # Jest tests
```

### Backend

```bash
cd backend
python server.py                              # Start dev server
pytest -v                                     # Run all tests
pytest -k test_create -v                      # Run specific tests
black .                                       # Format
isort .                                       # Sort imports
alembic upgrade head                          # Apply migrations
alembic revision --autogenerate -m "msg"      # Generate migration
```

### Docker

```bash
docker-compose up --build        # Build and start all services
docker-compose up -d             # Run in background
docker-compose down              # Stop
docker-compose logs -f           # Follow logs
docker-compose exec py-backend alembic upgrade head  # Run migrations in container
```

## Debugging Tips

### Frontend won't start

```bash
rm -rf .next                              # Clear Next.js cache
rm -rf node_modules && npm install        # Reinstall deps
lsof -i :3000                             # Check port conflict
```

### Backend won't start

```bash
pip install --upgrade -r requirements.txt  # Ensure deps are current
lsof -i :8000                              # Check port conflict
```

### Database connection error

- Verify `DATABASE_URL` in `backend/.env` is correct
- Confirm PostgreSQL is running: `brew services start postgresql` (macOS) or `sudo systemctl start postgresql` (Linux)
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### Database reset

```bash
dropdb hafb && createdb hafb
cd backend && alembic upgrade head
```

## Documentation Reference

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System design and data flow
- **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** — Backend patterns and testing
- **[DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md)** — Design system and component workflow
- **[DOCKER.md](./DOCKER.md)** — Docker setup
- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** — Frontend architecture and conventions
- **[GIT.md](./GIT.md)** — Git workflow
- **[ONBOARDING.md](./ONBOARDING.md)** — This document
- **[SCHEMA.md](./SCHEMA.md)** — Entity reference
- **[TECH_DEBT.md](./TECH_DEBT.md)** — Technical debt tracking
