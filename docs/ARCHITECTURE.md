# Home Again Furniture Bank - Technical Documentation

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Development Patterns](#development-patterns)
5. [Frontend Guide](#frontend-guide)
6. [Backend Guide](#backend-guide)
7. [Database](#database)
8. [Testing](#testing)
9. [Deployment](#deployment)

## Architecture

### System Design

The application follows a client-server architecture with clear separation of concerns:

- **Frontend**: Next.js 15 (React) with TypeScript
  - Server Components for sensitive data
  - Client Components for interactive UI
  - Zustand for global client state (auth, UI flags)
  - TanStack Query for server state (data from backend)

- **Backend**: FastAPI with Python
  - RESTful API design
  - Async/await for non-blocking operations
  - Pydantic for request/response validation
  - Automatic OpenAPI documentation

- **Database**: PostgreSQL via Supabase
  - Relational schema for structured data
  - Row-level security for fine-grained access control
  - Automatic backups and point-in-time recovery

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Server Components: Sensitive data, auth checks            │ │
│  │ Client Components: Interactive UI, forms, modals          │ │
│  │ Zustand: Auth store, UI state                            │ │
│  │ TanStack Query: Auto-caching, refetch, error handling    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (HTTP/HTTPS)
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ API Routes: Agencies, Donors, Clients, Furniture, etc.     │ │
│  │ Pydantic Schemas: Type validation, OpenAPI docs           │ │
│  │ SQLAlchemy Models: ORM, relationships                     │ │
│  │ Database Layer: Async SQLAlchemy with PostgreSQL          │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ SQL
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                  Database (PostgreSQL/Supabase)                 │
│  - Structured relational schema                                │
│  - Row-level security (RLS) policies                           │
│  - Point-in-time recovery & automated backups                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 | File-based routing, Server Components, optimal code splitting |
| Language | TypeScript | Type safety catches errors during development, not production |
| State (Client) | Zustand | Minimal boilerplate, perfect for UI state |
| State (Server) | TanStack Query | Auto-caching, refetch, race condition protection |
| UI Components | shadcn/ui | Source-owned components, customizable, built on Radix UI |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| Build Tool | Turbopack | Fast incremental builds, zero config |

### Backend

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | FastAPI | Modern, async, automatic OpenAPI docs |
| Language | Python 3.9+ | Mature ecosystem, readability, strong typing |
| ORM | SQLAlchemy 2.0 | Async support, modern Python patterns |
| Validation | Pydantic 2.0 | Type safety, automatic OpenAPI schema |
| Database | PostgreSQL | Relational, strong, 7+ year data retention support |
| Platform | Supabase | Managed PostgreSQL, auth, RLS, row-level security |
| Testing | pytest | Industry standard, great async support |

For the repository layout (frontend, backend, docs, etc.), see [Project structure](../README.md#project-structure) in the main [README](../README.md).

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.9+
- PostgreSQL 12+ (or use Supabase)
- Docker and Docker Compose (optional)

### Local Development

See [ONBOARDING.md](./ONBOARDING.md) for clone, install, and environment setup.

### Docker Setup

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API docs**: http://localhost:8000/docs

The backend runs Alembic migrations on startup. No `.env` files required.

## Development Patterns

### Adding a New Feature

#### Example: Add a "Trucks" resource

**Step 1: Backend Model** (`backend/app/models/base.py`)

```python
class Truck(Base):
    __tablename__ = "trucks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    licensePlate = Column(String(20), nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**Step 2: Backend Schemas** (`backend/app/schemas.py`)

```python
class TruckBase(BaseModel):
    make: str
    model: str
    licensePlate: str
    capacity: int

class TruckCreate(TruckBase):
    pass

class Truck(TruckBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
```

**Step 3: Backend Endpoints** (`backend/app/api/trucks.py`)

```python
router = APIRouter()

@router.get("", response_model=list[TruckSchema])
async def list_trucks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Truck))
    return result.scalars().all()

@router.post("", response_model=TruckSchema, status_code=status.HTTP_201_CREATED)
async def create_truck(truck: TruckCreate, db: AsyncSession = Depends(get_db)):
    db_truck = Truck(**truck.model_dump())
    db.add(db_truck)
    await db.commit()
    await db.refresh(db_truck)
    return db_truck
```

**Step 4: Register Router** (`backend/app/api/__init__.py`)

```python
from .trucks import router as trucks_router
router.include_router(trucks_router, prefix="/trucks", tags=["trucks"])
```

**Step 5: Frontend Types** (`frontend/types/index.ts`)

```typescript
export interface Truck {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}
```

**Step 6: Frontend Hooks** (`frontend/hooks/useApi.ts`)

```typescript
export function useTrucks() {
  return useQuery({
    queryKey: ["trucks"],
    queryFn: async () => {
      const response = await apiClient.get<Truck[]>("/trucks");
      return response.data;
    },
  });
}

export function useCreateTruck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (truck: Omit<Truck, "id" | "createdAt" | "updatedAt">) =>
      apiClient.post<Truck>("/trucks", truck),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}
```

**Step 7: Frontend Page** (`frontend/app/trucks/page.tsx`)

```typescript
"use client";

import { useTrucks } from "@/hooks/useApi";

export default function TrucksPage() {
  const { data: trucks, isLoading, error } = useTrucks();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading trucks</div>;

  return (
    <ul>
      {trucks?.map((truck) => (
        <li key={truck.id}>
          {truck.make} {truck.model} — {truck.licensePlate}
        </li>
      ))}
    </ul>
  );
}
```

## Frontend Guide

### File-Based Routing

Routes are defined by the file structure in `frontend/app/`:

```
frontend/app/
├── page.tsx              → /
├── layout.tsx            → Root layout (includes Providers)
├── loading.tsx           → Global loading UI
├── providers.tsx         → QueryClientProvider
└── agencies/
    └── page.tsx          → /agencies
```

### Server vs Client Components

**Server Components** (default) — run on server, good for:
- Fetching sensitive data
- Auth checks and redirects

**Client Components** — run in browser, required for:
- Hooks (useState, useEffect, TanStack Query)
- User interactions (clicks, forms)
- Browser APIs

```typescript
// Must be at the top of the file
"use client";

import { useAgencies } from "@/hooks/useApi";

export default function AgenciesPage() {
  const { data: agencies, isLoading } = useAgencies();
  // ...
}
```

### State Management

| Need | Tool | Location |
|------|------|----------|
| Local UI state | `useState` | Inside component |
| Global auth/UI | Zustand | `stores/authStore.ts`, `stores/uiStore.ts` |
| Server data | TanStack Query | `hooks/useApi.ts` |

### API Integration

All API calls go through `lib/apiClient.ts` — an axios instance that automatically attaches auth tokens and handles 401 redirects. Never call `fetch` directly; use the hooks in `hooks/useApi.ts`.

## Backend Guide

See [API_GUIDE.md](./API_GUIDE.md) for detailed backend documentation including async patterns, endpoint examples, error handling, and testing.

## Database

### Schema

```
Admins (standalone; link to Supabase Auth via supabase_user_id)

Agencies (partner organizations)
  ├─ Agents (one-to-many)
  ├─ Clients (one-to-many)
  └─ Referrals (one-to-many)

Clients
  ├─ Referrals (one-to-many)
  └─ Furniture received (one-to-many, via client_id)

Donors
  └─ Furniture (one-to-many)

Furniture
  ├─ Donor (many-to-one)
  ├─ Client (many-to-one, nullable)
  └─ Route (many-to-one, nullable, via route_id)

Referrals
  ├─ Client (many-to-one)
  └─ Agency (many-to-one)

Routes
  └─ Furniture (via pickup_furniture_ids / dropoff_furniture_ids and route_id)
```

### Data model relationships

- **Admin** — Standalone; links to Supabase Auth via `supabase_user_id`.
- **Agent** → **Agency** (many-to-one).
- **Agency** → **Agents**, **Clients**, **Referrals** (one-to-many).
- **Client** → **Agency** (many-to-one, via `agency_id`); **Agency** (many-to-one, via `agency_referred_id`); **Referrals**, **Furniture** (one-to-many).
- **Donor** → **Furniture** (one-to-many).
- **Furniture** → **Donor** (many-to-one); **Client** (many-to-one, nullable); **Route** (many-to-one, nullable, via `route_id`).
- **Referral** → **Client**, **Agency** (many-to-one).
- **Route** → **Furniture** (one-to-many, via `pickup_furniture_ids`, `dropoff_furniture_ids`, and `route_id`).

### Migrations

```bash
cd backend

# Create migration after model changes
alembic revision --autogenerate -m "Add truck table"

# Apply
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing

```bash
# Frontend
cd frontend
npm test

# Backend unit + functional
cd backend
pytest -v

# End-to-end
cd e2e-tests
pytest -v
```

## Deployment

### Docker

```bash
docker-compose build
docker-compose up
```

### Environment Variables

Never commit `.env` files. Use `.env.example` as the reference template.

### CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `lint.yml` — runs ESLint (frontend) and Black (backend) on every push/PR to `main`
- `firebase-hosting-merge.yml` — deploys frontend to Firebase on merge to `main`
- `heroku-deploy-dev-py.yml` — deploys backend to Heroku

## Maintenance & Onboarding

See [ONBOARDING.md](./ONBOARDING.md) for the full developer onboarding guide.

### Code Style

- **Python**: PEP 8, type hints on all functions, docstrings on public methods
- **TypeScript**: strict mode, explicit types, no `any`
- **Components**: small and focused, under 100 lines
- **Comments**: explain *why*, not *what*
