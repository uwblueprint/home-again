# Home Again Furniture Bank - Web Application

Getting the furniture to the people who need it most.

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
# (recommended) create and activate a venv:
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 server.py  # http://localhost:8000/docs
```

### Docker (all services)

With Docker and Docker Compose you can run the full stack without installing Node, Python, or PostgreSQL locally:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:8000  
- **API docs (Swagger)**: http://localhost:8000/docs  

The backend runs database migrations on startup. No `.env` files are required; see [Docker](#docker) below for overrides and details.

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
├── frontend/              # Next.js React application
│   ├── app/              # App Router (file-based routing)
│   ├── src/components/   # Reusable React components
│   ├── src/hooks/        # TanStack Query hooks for API
│   ├── src/stores/       # Zustand stores (auth, UI)
│   ├── src/lib/          # Utilities (API client, Supabase)
│   ├── src/types/        # TypeScript types matching backend
│   └── package.json
│
├── backend/       # FastAPI application
│   ├── app/
│   │   ├── main.py      # FastAPI app factory
│   │   ├── config.py    # Environment configuration
│   │   ├── database.py  # SQLAlchemy setup
│   │   ├── schemas.py   # Pydantic models for validation
│   │   ├── models/      # SQLAlchemy ORM models
│   │   └── api/         # REST API endpoints (organized by resource)
│   ├── server.py        # Uvicorn entry point
│   ├── requirements.txt  # Python dependencies
│   └── .env.example     # Example configuration
│
├── ARCHITECTURE.md       # Detailed architecture guide
├── README.md            # This file
└── docker-compose.yml   # Multi-container setup
```

## Key Features (Starter Foundation)

- **One full stack example**: Agencies have full CRUD (backend + frontend). Use this as the pattern for other resources.
- **Type-safe**: TypeScript types in `frontend/src/types/` match Pydantic schemas; use `src/lib/apiClient.ts` and `src/hooks/useApi.ts` for API calls.
- **Ready to extend**: Implement Donors, Clients, Inventory, Referrals, and Deliveries by following [STARTER_BACKEND_GUIDE.md](backend/STARTER_BACKEND_GUIDE.md) and the Agencies code.
- **Docs**: [ARCHITECTURE.md](./ARCHITECTURE.md), [API_GUIDE.md](./backend/API_GUIDE.md), and [ONBOARDING.md](./ONBOARDING.md) describe patterns and how to add features.

## Core Domains

- **Agencies**: Full CRUD implemented at `/api/agencies` (reference implementation). Frontend example at `/agencies`.
- **Donors, Clients, Inventory, Referrals, Deliveries**: Models and schemas exist; routers are registered but return 501 until you implement them. See [backend/STARTER_BACKEND_GUIDE.md](./backend/STARTER_BACKEND_GUIDE.md).

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, data flow, and development patterns
- **[DOCKER.md](./DOCKER.md)** - Running with Docker Compose
- **[backend/API_GUIDE.md](./backend/API_GUIDE.md)** - REST API patterns and adding endpoints
- **[backend/STARTER_BACKEND_GUIDE.md](./backend/STARTER_BACKEND_GUIDE.md)** - How to implement the remaining resources
- **[ONBOARDING.md](./ONBOARDING.md)** - Developer onboarding and first tasks

## Development

### Making Your First Change

**Backend**: Implement a resource
1. Add/extend SQLAlchemy model in `app/models/`
2. Add or update Pydantic schema in `app/schemas.py`
3. Create a FastAPI router in `app/api/my_resource.py` following the examples
4. Register the router in `app/api/__init__.py`
5. Run the server and verify API docs at `/docs`

**Frontend**: Implement a UI view
1. Create components under `src/components/`
2. Use `src/lib/apiClient.ts` for HTTP and `src/hooks/useApi.ts` (TanStack Query) for data fetching
3. Add a page under `frontend/app/` (e.g. `app/agencies/page.tsx`)

### Running Tests

```bash
# Backend
cd backend
pytest -v

# Frontend
cd frontend
npm test
```

### Environment Variables

Frontend `.env.local` (example):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Backend `.env` (example):

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/hafb
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production
```

### Docker

**Start everything** (frontend, backend, PostgreSQL):

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8000  
- API docs: http://localhost:8000/docs  

Containers use fixed env vars (see `docker-compose.yml`), so no `.env` or `.env.local` is required. To override (e.g. different DB password), add `backend/.env` or `frontend/.env.local` and uncomment or add the `env_file` entries in `docker-compose.yml`.

**Useful commands:**

```bash
docker-compose up -d          # Run in background
docker-compose down          # Stop and remove containers
docker-compose logs -f       # Follow logs
docker-compose exec py-backend alembic upgrade head   # Re-run migrations
```

## API Documentation

Once the backend is running:

- **Swagger UI** (interactive): http://localhost:8000/docs
- **ReDoc** (static): http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

Documentation is automatically generated from Pydantic schemas.

## Code Style

### Python
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints for all functions
- Add docstrings to functions and classes

### TypeScript
- Use strict mode
- Provide explicit types
- Keep components small and focused
- Use descriptive variable names

## Database

### Local Development
```bash
createdb hafb
createdb hafb_test
```

### Migrations
```bash
cd backend
alembic revision --autogenerate -m "Your migration message"
alembic upgrade head
```

## Deployment

See [ARCHITECTURE.md - Deployment Section](./ARCHITECTURE.md#deployment) for detailed deployment instructions.

## Troubleshooting

### Backend won't start
```bash
# Check Python version (need 3.9+)
python --version

# Reinstall dependencies
pip install -r requirements.txt

# Verify database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Frontend won't start
```bash
# Check Node version (need 18+)
node --version

# Clear cache
rm -rf node_modules .next && npm install

# Check port 3000
lsof -i :3000
```

### Database connection error
- Check `.env` file has correct `DATABASE_URL`
- Verify PostgreSQL is running
- Check credentials are correct

## Getting Help

- **Architecture & Design**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Backend Development**: Read [backend/API_GUIDE.md](./backend/API_GUIDE.md)
- **FastAPI Official Docs**: https://fastapi.tiangolo.com/
- **Next.js Official Docs**: https://nextjs.org/docs
- **Zustand Documentation**: https://zustand.docs.pmnd.rs/
- **TanStack Query**: https://tanstack.com/query/latest

## Git Workflow

```bash
git checkout -b feature/add-new-feature
# Make changes...
git add .
git commit -m "feat: add new feature"
git push origin feature/add-new-feature
# Open pull request on GitHub
```

---

**Ready to get started?** Check out the [Quick Start](#quick-start) section above or read [ARCHITECTURE.md](./ARCHITECTURE.md) for a complete guide! 🚀
