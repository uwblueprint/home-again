# Home Again Furniture Bank - Web Application

Ending furniture poverty for good — one delivery at a time.

## Table of contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features (Starter Code)](#key-features-starter-code)
- [Core Domains](#core-domains)
- [Documentation](#documentation)
- [Getting Help](#getting-help)

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
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # Detailed architecture guide
│   ├── ONBOARDING.md          # Developer onboarding
│   ├── DOCKER.md              # Docker setup guide
│   ├── API_GUIDE.md           # REST API patterns
│   ├── STARTER_BACKEND_GUIDE.md  # Implementing remaining resources
│   └── GIT.md                 # Git workflow and Jira integration
└── docker-compose.yml         # Multi-container setup
```

## Key Features (Starter Code)

- **One full stack example**: Agencies have full CRUD (backend + frontend). Use this as the pattern for other resources.
- **Type-safe**: TypeScript types in `frontend/types/` match Pydantic schemas; use `lib/apiClient.ts` and `hooks/useApi.ts` for all API calls.
- **Ready to extend**: Implement Donors, Clients, Furniture, Referrals, Routes, Admins, and Agents by following [docs/STARTER_BACKEND_GUIDE.md](docs/STARTER_BACKEND_GUIDE.md) and the Agencies code.
- **Documented**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API_GUIDE.md](docs/API_GUIDE.md), and [docs/ONBOARDING.md](docs/ONBOARDING.md) cover patterns and how to add features.

## Core Domains

- **Agencies**: Full CRUD at `/api/agencies` (reference implementation). Frontend at `/agencies`.
- **Donors, Clients, Furniture, Referrals, Routes, Admins, Agents**: Models and schemas exist; routers registered but return 501 until implemented. See [docs/STARTER_BACKEND_GUIDE.md](docs/STARTER_BACKEND_GUIDE.md).

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design, data flow, and development patterns
- **[docs/DOCKER.md](docs/DOCKER.md)** — Running with Docker Compose
- **[docs/ONBOARDING.md](docs/ONBOARDING.md)** — Developer onboarding and first tasks
- **[docs/API_GUIDE.md](docs/API_GUIDE.md)** — REST API patterns and adding endpoints
- **[docs/STARTER_BACKEND_GUIDE.md](docs/STARTER_BACKEND_GUIDE.md)** — How to implement the remaining resources
- **[docs/GIT.md](docs/GIT.md)** — Git workflow and Jira integration

New to the repo? See [Developer onboarding](docs/ONBOARDING.md) to get the local environment running and for development workflows, tests, linting, environment variables, and troubleshooting.

## Getting Help

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Backend patterns**: [docs/API_GUIDE.md](docs/API_GUIDE.md)
- **FastAPI docs**: https://fastapi.tiangolo.com/
- **Next.js docs**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **Zustand**: https://zustand.docs.pmnd.rs/
