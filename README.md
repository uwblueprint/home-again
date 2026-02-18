# Home Again Furniture Bank - Web Application

Ending furniture poverty for good — one delivery at a time.

## Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev  # http://localhost:3000
```

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 server.py  # http://localhost:8000/docs
```

### Docker (all services)

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API docs (Swagger)**: http://localhost:8000/docs

The backend runs database migrations on startup. No `.env` files are required; see [DOCKER.md](./DOCKER.md) for overrides and details.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + TypeScript + Zustand + TanStack Query | Modern React UI with file-based routing, state management, and automatic API caching |
| **Backend** | FastAPI + Python + Pydantic | Async REST API with automatic OpenAPI documentation |
| **Database** | PostgreSQL / Supabase | Relational database with row-level security |
| **Build** | Turbopack + Tailwind CSS | Fast builds with utility-first styling |

## Project Structure

```
home-again/
├── frontend/                  # Next.js React application
│   ├── app/                   # App Router (file-based routing)
│   │   ├── layout.tsx         # Root layout with Providers
│   │   ├── page.tsx           # Home page
│   │   ├── loading.tsx        # Global loading state
│   │   ├── providers.tsx      # TanStack Query provider
│   │   └── agencies/          # Agencies resource page
│   ├── components/            # Reusable React components
│   ├── hooks/                 # TanStack Query hooks (useApi.ts)
│   ├── stores/                # Zustand stores (auth, UI)
│   ├── lib/                   # apiClient.ts, supabase.ts
│   ├── types/                 # TypeScript types matching backend
│   ├── constants/             # Config, Routes, AuthConstants
│   └── utils/                 # CSVUtils, LocalStorageUtils
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app factory
│   │   ├── config.py          # Environment configuration
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── schemas.py         # Pydantic models for validation
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── api/               # REST endpoints by resource
│   │   └── utilities/         # Shared utilities (csv_utils, etc.)
│   ├── migrations/            # Alembic migrations
│   ├── tests/                 # Unit and functional tests
│   └── server.py              # Uvicorn entry point
│
├── e2e-tests/                 # End-to-end test suite
├── ARCHITECTURE.md            # Detailed architecture guide
├── ONBOARDING.md              # Developer onboarding
├── DOCKER.md                  # Docker setup guide
└── docker-compose.yml         # Multi-container setup
```

## Key Features (Starter Code)

- **One full stack example**: Agencies have full CRUD (backend + frontend). Use this as the pattern for other resources.
- **Type-safe**: TypeScript types in `frontend/types/` match Pydantic schemas; use `lib/apiClient.ts` and `hooks/useApi.ts` for all API calls.
- **Ready to extend**: Implement Donors, Clients, Furniture, Referrals, Routes, Admins, and Agents by following [backend/STARTER_BACKEND_GUIDE.md](backend/STARTER_BACKEND_GUIDE.md) and the Agencies code.
- **Documented**: [ARCHITECTURE.md](./ARCHITECTURE.md), [backend/API_GUIDE.md](./backend/API_GUIDE.md), and [ONBOARDING.md](./ONBOARDING.md) cover patterns and how to add features.

## Core Domains

- **Agencies**: Full CRUD at `/api/agencies` (reference implementation). Frontend at `/agencies`.
- **Donors, Clients, Furniture, Referrals, Routes, Admins, Agents**: Models and schemas exist; routers registered but return 501 until implemented. See [backend/STARTER_BACKEND_GUIDE.md](./backend/STARTER_BACKEND_GUIDE.md).

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System design, data flow, and development patterns
- **[DOCKER.md](./DOCKER.md)** — Running with Docker Compose
- **[ONBOARDING.md](./ONBOARDING.md)** — Developer onboarding and first tasks
- **[backend/API_GUIDE.md](./backend/API_GUIDE.md)** — REST API patterns and adding endpoints
- **[backend/STARTER_BACKEND_GUIDE.md](./backend/STARTER_BACKEND_GUIDE.md)** — How to implement the remaining resources

## Development

### Making Your First Change

**Backend**: Implement a resource
1. Add/extend SQLAlchemy model in `backend/app/models/base.py`
2. Add Pydantic schema in `backend/app/schemas.py`
3. Create a FastAPI router in `backend/app/api/my_resource.py`
4. Register the router in `backend/app/api/__init__.py`
5. Verify at http://localhost:8000/docs

**Frontend**: Implement a UI view
1. Add types to `frontend/types/index.ts`
2. Add a hook to `frontend/hooks/useApi.ts`
3. Create components under `frontend/components/`
4. Add a page under `frontend/app/my-resource/page.tsx`

### Running Tests

```bash
# Backend
cd backend
pytest -v

# Frontend
cd frontend
npm test

# End-to-end
cd e2e-tests
pytest -v
```

### Linting & Formatting

```bash
# Frontend — check
cd frontend
npm run lint

# Frontend — auto-fix
npm run lint:fix
npm run format

# Backend
cd backend
black .
```

### Docker

```bash
docker-compose up --build     # Build and start everything
docker-compose up -d          # Run in background
docker-compose down           # Stop and remove containers
docker-compose logs -f        # Follow logs
```

## Environment Variables

Frontend `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Backend `backend/.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/hafb
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production
```

## API Documentation

Once the backend is running:
- **Swagger UI** (interactive): http://localhost:8000/docs
- **ReDoc** (static): http://localhost:8000/redoc

## Troubleshooting

### Frontend won't start
```bash
node --version          # Need 20+
rm -rf node_modules .next && npm install
lsof -i :3000           # Check port
```

### Backend won't start
```bash
python --version        # Need 3.9+
pip install -r requirements.txt
psql $DATABASE_URL -c "SELECT 1"
lsof -i :8000           # Check port
```

### Database connection error
- Check `backend/.env` has correct `DATABASE_URL`
- Verify PostgreSQL is running (`brew services start postgresql` on Mac)

## Getting Help

- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Backend patterns**: [backend/API_GUIDE.md](./backend/API_GUIDE.md)
- **FastAPI docs**: https://fastapi.tiangolo.com/
- **Next.js docs**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **Zustand**: https://zustand.docs.pmnd.rs/

---

**Ready to get started?** See the [Quick Start](#quick-start) above or read [ONBOARDING.md](./ONBOARDING.md) for a guided walkthrough.