# Home Again Furniture Bank - Technical Documentation

## Overview

Home Again Furniture Bank (HAFB) is a furniture donation and delivery management system built with a modern,
scalable tech stack optimized for long-term maintenance and ease of onboarding for rotating teams of developers.

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Development Patterns](#development-patterns)
6. [Frontend Guide](#frontend-guide)
7. [Backend Guide](#backend-guide)
8. [Database](#database)
9. [Testing](#testing)
10. [Deployment](#deployment)

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
│  │ API Routes: Agencies, Donors, Clients, Inventory, etc.    │ │
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

## Project Structure

```
home-again/
├── frontend/                    # Next.js application
│   ├── app/                     # App Router (file-based routing)
│   │   ├── layout.tsx           # Root layout with Providers
│   │   ├── page.tsx             # Home page
│   │   ├── loading.tsx          # Global loading state
│   │   ├── providers.tsx        # TanStack Query provider
│   │   └── agencies/            # Example resource page
│   ├── components/              # Reusable React components
│   ├── hooks/                   # TanStack Query hooks (useApi)
│   ├── stores/                  # Zustand stores (auth, UI)
│   ├── lib/                     # apiClient.ts, supabase.ts
│   ├── types/                   # TypeScript types (match backend)
│   ├── constants/               # Config, Routes, AuthConstants
│   └── utils/                   # e.g. CSVUtils for reporting
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py              # FastAPI app factory
│   │   ├── config.py            # Pydantic settings
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── schemas.py           # Pydantic models
│   │   ├── models/
│   │   │   └── base.py          # SQLAlchemy ORM models
│   │   ├── api/
│   │   │   ├── __init__.py      # Main router
│   │   │   ├── agencies.py
│   │   │   ├── donors.py
│   │   │   ├── clients.py
│   │   │   ├── inventory.py
│   │   │   ├── referrals.py
│   │   │   └── deliveries.py
│   │   └── utilities/
│   │       └── csv_utils.py
│   ├── migrations/              # Alembic migrations
│   ├── tests/
│   │   ├── functional/
│   │   └── unit/
│   ├── server.py                # Uvicorn entry point
│   └── requirements.txt
│
├── e2e-tests/                   # End-to-end test suite
├── docker-compose.yml           # Multi-container setup
├── README.md                    # Project overview
├── ARCHITECTURE.md              # This file
├── ONBOARDING.md                # Developer onboarding
└── DOCKER.md                    # Docker setup guide
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.9+
- PostgreSQL 12+ (or use Supabase)
- Docker and Docker Compose (optional)

### Local Development

#### 1. Clone and Install

```bash
git clone <repo-url>
cd home-again

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Environment Configuration

```bash
# Frontend (.env.local)
cd frontend
cp .env.example .env.local
# Edit with your values:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Backend (.env)
cd ../backend
cp .env.example .env
# Edit with your values:
# DATABASE_URL=postgresql://user:password@localhost:5432/hafb
```

#### 3. Database Setup

```bash
# If using local PostgreSQL:
createdb hafb
createdb hafb_test

# Run migrations
cd backend
alembic upgrade head
```

#### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
python server.py
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs

# Terminal 2: Frontend
cd frontend
npm run dev
# App runs at http://localhost:3000
```

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

See [API_GUIDE.md](./backend/API_GUIDE.md) for detailed backend documentation including async patterns, endpoint examples, error handling, and testing.

## Database

### Schema

```
Agencies (partner organizations)
  └─ Clients (furniture recipients)
      └─ Referrals (requests)
          └─ Deliveries (fulfillment)

Donors (furniture donors)
  └─ InventoryItems (furniture)
```

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