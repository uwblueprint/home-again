# Home Again Furniture Bank - Web Application

Ending furniture poverty for good — one delivery at a time.

## Table of contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Core Domains](#core-domains)
- [Design System Variables](#design-system-variables)
- [Documentation](#documentation)
- [Getting Help](#getting-help)

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + TypeScript + Zustand + TanStack Query | Modern React UI with file-based routing, state management, and automatic API caching |
| **Backend** | FastAPI + Python + Pydantic | Async REST API with automatic OpenAPI documentation |
| **Database** | PostgreSQL / Supabase | Relational database |
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
│   │   ├── agencies/          # Agencies resource page
│   │   ├── agent-intake/      # Agent intake page
│   │   ├── component-gallery/ # Component gallery page
│   │   ├── donate/            # Donation page
│   │   └── referral-form/     # Referral form page
│   ├── common/                # Shared frontend code
│   │   ├── components/        # Reusable React components
│   │   ├── hooks/             # TanStack Query hooks (useApi.ts)
│   │   ├── stores/            # Zustand stores (auth, UI)
│   │   ├── lib/               # apiClient.ts, utils.ts
│   │   ├── types/             # TypeScript types matching backend
│   │   ├── constants/         # Config, Routes, AuthConstants
│   │   └── utils/             # CSVUtils, LocalStorageUtils
│   └── styles/                # CSS token files (colors, typography, spacing, border-radii)
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app factory
│   │   ├── config.py          # Environment configuration
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── enums.py           # StrEnum constants for all categorical fields
│   │   ├── schemas.py         # Pydantic models for validation
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── api/               # REST endpoints by resource
│   │   ├── services/          # Business logic by resource
│   │   └── utilities/         # Shared utilities (csv_utils, etc.)
│   ├── migrations/            # Alembic migrations
│   ├── tests/                 # Integration tests
│   └── server.py              # Uvicorn entry point
│
├── db-init/                   # Database initialization scripts
├── hooks/                     # Git hooks (post-merge)
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # System design and data model
│   ├── BACKEND_GUIDE.md       # Backend patterns, adding resources, testing
│   ├── DESIGN_SYSTEM_GUIDE.md # Design system usage and token architecture
│   ├── DOCKER.md              # Docker setup guide
│   ├── FRONTEND_GUIDE.md      # Frontend patterns and directory structure
│   ├── GIT.md                 # Git workflow and Jira integration
│   ├── ONBOARDING.md          # Developer onboarding
│   ├── SCHEMA.md              # Entity reference (fields, types, relationships)
│   └── TECH_DEBT.md           # Technical debt inventory and remediation
├── docker-compose.yml         # Multi-container setup
└── setup.sh                   # Project setup script
```

## Key Features

- **Fully implemented backend**: All 11 resources have complete CRUD — Admin, Agency, Agent, Donor, Donation, Client, Furniture, Referral, Route, Pickup, Dropoff.
- **Four-layer architecture**: models → schemas → services → routers. Services own all business logic; routers only translate HTTP. See [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md).
- **Type-safe**: TypeScript types in `frontend/common/types/` match Pydantic schemas; use `common/lib/apiClient.ts` and `common/hooks/useApi.ts` for all API calls.
- **Tested**: 132 integration tests using in-memory SQLite — no external services needed to run `pytest`.
- **Documented**: [docs/SCHEMA.md](docs/SCHEMA.md) for the full entity reference; [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md) for implementation patterns.

## Core Domains

- **Admin, Agency, Agent** — staff and partner organisation management
- **Donor, Donation** — donor and donation lifecycle
- **Client, Referral** — client intake and furniture requests
- **Furniture** — individual item tracking from donation through delivery
- **Route, Pickup, Dropoff** — dispatch routing; Pickup = collection stop from donor, Dropoff = delivery stop to client

## Design System Variables

Theme variables are split into token files and wired through `frontend/app/globals.css`.

- **Token files**
  - `frontend/styles/colors.css` (semantic/brand/raw colors + dark overrides)
  - `frontend/styles/typography.css` (font/typography tokens)
  - `frontend/styles/spacing.css` (spacing tokens)
  - `frontend/styles/border-radii.css` (border radius tokens)
- **Wiring entrypoint**
  - `frontend/app/globals.css` imports token files and maps variables in `@theme inline`

When adding a new variable:

1. Add the variable in the correct token file (for example `--status-success` in `colors.css`).
2. If it needs dark mode behavior, add/override it in the `.dark` block in `colors.css`.
3. If Tailwind utility classes should expose it (for example `bg-status-success`), map it in `frontend/app/globals.css` inside `@theme inline`:
   - `--color-status-success: var(--status-success);`
4. Use it in UI via Tailwind utility classes or CSS variables in components.
5. Run frontend checks:
   - `cd frontend && npm run type-check && npm run lint && npm run test && npm run build`

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design, data flow, and development patterns
- **[docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md)** — Backend patterns, adding resources, testing
- **[docs/DESIGN_SYSTEM_GUIDE.md](docs/DESIGN_SYSTEM_GUIDE.md)** — Design system usage, token architecture, and component workflow
- **[docs/DOCKER.md](docs/DOCKER.md)** — Running with Docker Compose
- **[docs/FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md)** — Frontend patterns and directory structure
- **[docs/GIT.md](docs/GIT.md)** — Git workflow and Jira integration
- **[docs/ONBOARDING.md](docs/ONBOARDING.md)** — Developer onboarding and first tasks
- **[docs/SCHEMA.md](docs/SCHEMA.md)** — Entity reference (fields, types, relationships)
- **[docs/TECH_DEBT.md](docs/TECH_DEBT.md)** — Technical debt inventory and remediation tracking

New to the repo? See [Developer onboarding](docs/ONBOARDING.md) to get the local environment running and for development workflows, tests, linting, environment variables, and troubleshooting.

## Getting Help

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Backend patterns**: [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md)
- **Entity reference**: [docs/SCHEMA.md](docs/SCHEMA.md)
- **FastAPI docs**: https://fastapi.tiangolo.com/
- **Next.js docs**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **Zustand**: https://zustand.docs.pmnd.rs/
