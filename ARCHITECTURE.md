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
  - OpenAPI documentation automatic

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
└──────────────────────────────────────────────────────────────────┘
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
│   │   ├── providers.tsx        # TanStack Query provider
│   │   └── agencies/            # Example resource page
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── hooks/                # TanStack Query hooks (useApi)
│   │   ├── stores/               # Zustand stores (auth, UI)
│   │   ├── lib/                  # apiClient.ts, supabase.ts
│   │   ├── types/                # TypeScript types (match backend)
│   │   ├── constants/           # Config, Routes
│   │   └── utils/                # e.g. CSVUtils for reporting
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/
│   └── python/
│       ├── app/
│       │   ├── main.py         # FastAPI app factory
│       │   ├── config.py       # Pydantic settings
│       │   ├── database.py     # SQLAlchemy setup
│       │   ├── schemas.py      # Pydantic models
│       │   ├── models/
│       │   │   ├── base.py     # SQLAlchemy ORM models
│       │   │   └── __init__.py
│       │   └── api/
│       │       ├── __init__.py # Main router
│       │       ├── agencies.py
│       │       ├── donors.py
│       │       ├── clients.py
│       │       ├── inventory.py
│       │       ├── referrals.py
│       │       └── deliveries.py
│       ├── server.py           # Uvicorn entry point
│       ├── requirements.txt    # Dependencies
│       └── .env.example        # Example config
│
├── docker-compose.yml          # Multi-container setup
├── README.md                   # Project overview
└── ARCHITECTURE.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL 12+ (or use Supabase)
- Docker and Docker Compose (optional)

### Local Development

#### 1. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd home-again

# Install frontend dependencies
cd frontend
npm install
# or yarn install

# Install backend dependencies
cd ../backend/python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
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
cd ../backend/python
cp .env.example .env
# Edit with your values:
# DATABASE_URL=postgresql://user:password@localhost:5432/hafb
# SUPABASE_URL=...
# SUPABASE_KEY=...
```

#### 3. Database Setup

```bash
# If using local PostgreSQL:
createdb hafb
createdb hafb_test

# If using Supabase, connection string automatically configured in .env

# Run migrations (if any)
cd backend/python
alembic upgrade head
```

#### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend/python
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

- **Frontend**: http://localhost:3000 (Next.js dev server, with hot reload)
- **Backend**: http://localhost:8000 (FastAPI; runs Alembic migrations on startup)
- **PostgreSQL**: localhost:5432 (user `hafb_user`, database `hafb`)

No `.env` files are required; see [README.md - Docker](README.md#docker) for overrides.

## Development Patterns

### Adding a New Feature

#### Example: Add a "Trucks" resource

**Step 1: Backend Model** (`app/models/base.py`)

```python
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime

class Truck(Base):
    __tablename__ = "trucks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    licensePlate = Column(String(20), nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)  # in lbs
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**Step 2: Backend Schemas** (`app/schemas.py`)

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

**Step 3: Backend Endpoints** (`app/api/trucks.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db
from ..models import Truck
from ..schemas import TruckCreate, Truck as TruckSchema

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

# ... other CRUD operations
```

**Step 4: Register Router** (`app/api/__init__.py`)

```python
from .trucks import router as trucks_router

router.include_router(trucks_router, prefix="/trucks", tags=["trucks"])
```

**Step 5: Frontend Types** (`src/types/index.ts`)

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

**Step 6: Frontend Hooks** (`src/hooks/useApi.ts`)

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

**Step 7: Frontend Component** (`src/components/TruckList.tsx`)

```typescript
"use client";

import { useTrucks } from "@/hooks/useApi";

export function TruckList() {
  const { data: trucks, isLoading, error } = useTrucks();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {trucks?.map((truck) => (
        <li key={truck.id}>
          {truck.make} {truck.model} - {truck.licensePlate}
        </li>
      ))}
    </ul>
  );
}
```

## Frontend Guide

### File-Based Routing with Next.js App Router

Routes are defined by your file structure in `frontend/app/`:

```
frontend/app/
├── page.tsx              → /
├── layout.tsx            → Root layout (includes Providers)
├── providers.tsx         → QueryClientProvider for TanStack Query
└── agencies/
    └── page.tsx          → /agencies (example resource)
```

### Server vs Client Components

**Server Components** (default) - Run on server, great for:
- Fetching sensitive data
- Accessing backend directly (coming in future)
- Security checks (auth, permissions)

```typescript
// frontend/app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser(); // Server-only
  
  if (!user) redirect("/login");
  
  return <Dashboard user={user} />;
}
```

**Client Components** - Run in browser, required for:
- User interactivity (clicks, forms, etc.)
- Browser APIs (localStorage, etc.)
- Hooks like useState, useEffect, custom hooks

```typescript
// src/components/Dashboard.tsx
"use client";

import { Dashboard as DashboardComponent } from "@/components/ui/dashboard";

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [filters, setFilters] = useState({});
  const { data: agencies } = useAgencies();
  
  return <DashboardComponent user={user} agencies={agencies} />;
}
```

### State Management Patterns

**Local State** - Component-only, no global access needed:

```typescript
"use client";

import { useState } from "react";

function SearchForm() {
  const [query, setQuery] = useState("");
  
  return (
    <input 
      value={query} 
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

**Global Client State** - Auth, UI flags (Zustand):

```typescript
// Using auth store
"use client";

import { useAuthStore } from "@/stores/authStore";

function UserButton() {
  const { user, logout } = useAuthStore();
  
  return (
    <button onClick={logout}>
      Logout {user?.email}
    </button>
  );
}
```

**Server State** - Data from API (TanStack Query):

```typescript
// Fetching agencies
"use client";

import { useAgencies } from "@/hooks/useApi";

function AgenciesList() {
  const { data: agencies, isLoading } = useAgencies();
  
  // Automatically:
  // - Fetches from /api/agencies
  // - Caches result
  // - Handles errors
  // - Refetches on focus
  
  return isLoading ? <Loading /> : <List agencies={agencies} />;
}
```

### API Integration

All API calls go through the centralized client with auth handling:

```typescript
// src/lib/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Automatically adds auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage in hooks:
export function useAgencies() {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: () => apiClient.get("/agencies").then(r => r.data),
  });
}
```

## Backend Guide

See [API_GUIDE.md](./backend/python/API_GUIDE.md) for detailed backend documentation including:
- Async patterns
- Adding new endpoints
- Database model relationships
- Error handling
- Testing

## Database

### Schema Design

The database uses a relational model supporting the HAFB workflow:

```
Agencies (partner organizations)
  ├─ Clients (furniture recipients)
  │   └─ Referrals (requests)
  │       └─ Deliveries (fulfillment)
  │
Donors (furniture donors)
  └─ InventoryItems (furniture)
```

### Migrations

Database schema changes use Alembic:

```bash
# Create migration after model changes
cd backend/python
alembic revision --autogenerate -m "Add truck table"

# Review the generated file in migrations/versions/

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## Testing

### Frontend Tests

```bash
cd frontend
npm run test
```

### Backend Tests

```bash
cd backend/python
pytest
# or watch mode
pytest -v --tb=short
```

## Deployment

### Docker Build

```bash
docker-compose build
docker-compose up
```

### Environment Variables

Never commit `.env` files. Use `.env.example` as reference.

### Supabase Deployment

1. Create Supabase project
2. Run migrations against production database
3. Update environment variables
4. Deploy using your CI/CD provider

## Maintenance & Onboarding

### For New Developers

1. Read this documentation
2. Check out [API_GUIDE.md](./backend/python/API_GUIDE.md)
3. Run local dev environment
4. Study a feature end-to-end (model → schema → endpoints → components)
5. Start with small features
6. Ask questions!

### Code Style

- **Python**: Follow PEP 8, use type hints
- **TypeScript**: Use strict mode, provide explicit types
- **Components**: Keep them small and focused
- **Functions**: One responsibility per function
- **Comments**: Explain *why*, not *what*

### Documentation Standards

- Add docstrings to functions/classes
- Comment complex logic
- Update docs when architecture changes
- Keep README.md current
