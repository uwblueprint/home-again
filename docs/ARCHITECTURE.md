# Architecture

Technical stack and architectural decisions for the Home Again Furniture Bank (HAFB) web application.

## Purpose

The system manages operational workflows for furniture intake, referral, delivery, and reporting across multiple regions. It is intended to be long-lived, compliance-oriented, and maintainable by rotating Blueprint developers.

## Requirements

### Functional

- Manage relational entities: agencies, clients, donors, inventory, referrals, deliveries
- Support multiple regions under HAFB
- Retain donor and delivery data for 7+ years (CRA compliance)
- Generate compliance-style reports (e.g., CRA donor records)
- Support role-based access control (admin vs agencies)
- Support address validation and route planning

### Non-Functional

- Strong data integrity and auditability
- Clear onboarding paths for new developers
- Clear design-to-code workflows
- Secure handling of sensitive client and donor data

---

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│  Server Components: Sensitive data, auth checks                 │
│  Client Components: Interactive UI, forms, modals               │
│  Zustand: Auth store, UI state                                  │
│  TanStack Query: Auto-caching, refetch, error handling          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (HTTP/HTTPS)
┌──────────────────────────┴──────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  API Routes → Pydantic Schemas → Services → SQLAlchemy Models   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ SQL (async via asyncpg)
┌──────────────────────────┴──────────────────────────────────────┐
│                  Database (PostgreSQL / Supabase)               │
│  Structured relational schema                                   │
│  Point-in-time recovery & automated backups                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend

### TypeScript

Type safety catches errors during development rather than production. API contracts are enforced through types, reducing integration bugs. Self-documenting code reduces onboarding time. Type safety can be extended across the stack through `openapi-typescript`, which generates TypeScript types from the FastAPI backend's OpenAPI schema.

### Next.js 15 (App Router)

- Sensitive data (donor records, client info) can be fetched in Server Components, reducing exposure in the browser
- File-based routing reduces custom routing logic, improving consistency and ease of onboarding
- Persistent layouts prevent unnecessary re-renders of shared UI (navigation, sidebars)
- Built-in optimizations (code splitting, caching) reduce performance tuning effort

### State Management

| Category | What lives here | Tool | Rationale |
|----------|----------------|------|-----------|
| Local state | Form inputs, UI toggles, modal open/close, temporary flags | `useState` | Direct ownership by the rendering component. Predictable lifecycle. Minimal abstraction. |
| Global client state | Auth-derived UI metadata, cross-page filters, UI preferences | Zustand | No reducers or boilerplate. Avoids unnecessary re-renders. Well-documented Next.js App Router patterns. |
| Server state | Entities from the API (agencies, donors, clients, referrals, inventory), paginated/filtered datasets | TanStack Query | Declarative fetching. Automatic caching and invalidation. Protection against race conditions and stale data. Single source of truth for remote state. |

By treating server data as a distinct category, the application avoids duplicating backend data in client stores.

### shadcn/ui

Source-owned components rather than a locked library. Critical for a system that must evolve over many years and be maintainable by different teams:

- No dependency lock-in — components live directly in the codebase
- Accessibility preserved via Radix UI primitives
- Full ownership enables customization for HAFB-specific needs

### Turbopack

- Significantly faster incremental builds improve developer iteration speed
- Zero manual configuration reduces tooling complexity
- Native Next.js support ensures consistent behavior across local development and production

For frontend patterns, directory structure, and conventions, see [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md).
For design tokens, Tailwind utilities, and component workflow, see [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md).

---

## Backend

### Python

Mature ecosystem with strong support for data-centric and backend systems. Extensive libraries for data validation, serialization, async I/O, and database access. Emphasis on readability and explicitness reduces cognitive overhead.

### FastAPI

- Pydantic schemas enforce request and response contracts, reducing the risk of invalid or inconsistent data
- Explicit endpoint definitions make business logic easier to reason about and audit
- OpenAPI generation supports clear API documentation and frontend integration
- Compatibility with pytest encourages thorough testing of business-critical workflows

### REST API Style

The domain maps cleanly to resource-based operations with well-defined lifecycles. Core entities (agencies, donors, clients, inventory, referrals, deliveries) correspond to stable resources that are created, read, updated, and archived over time. This results in:

- Endpoints that are easy to reason about and test
- Explicit request/response boundaries
- Errors that are easier to debug in production
- Minimal onboarding overhead for new developers

### Four-Layer Architecture

```
models/base.py      → ORM models (database schema and relationships)
enums.py            → StrEnum constants for categorical fields
schemas.py          → Pydantic request/response schemas
services/{x}.py     → Business logic (raises ValueError for domain errors)
api/{x}.py          → FastAPI routers (catches ValueError → HTTP 400)
```

Each layer depends only on the layers above it. Routers never touch the database directly; services never import from routers.

For canonical service/router patterns, how to add a resource, testing, and common pitfalls, see [BACKEND_GUIDE.md](./BACKEND_GUIDE.md).

---

## Database

### PostgreSQL via Supabase

- Managed PostgreSQL reduces operational and maintenance overhead
- Built-in authentication supports email/password and SSO without custom auth implementation
- Automated backups and environment management support long-term data retention and reliability

### Data Model

The system's data model is highly structured and relationship-driven, with long-term data retention and reporting requirements. Strong relational modeling supports clear relationships between donors, clients, agencies, inventory, and deliveries. Structured schemas enable reliable, multi-year reporting and auditing.

For the complete entity reference (fields, types, relationships), see [SCHEMA.md](./SCHEMA.md).

---

## Related Documentation

- [ONBOARDING.md](./ONBOARDING.md) — Getting started, environment setup, commands
- [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) — Service/router patterns, adding resources, testing
- [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) — Directory structure, state management, conventions
- [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) — Tokens, Tailwind, shadcn components
- [SCHEMA.md](./SCHEMA.md) — Entity reference (fields, types, relationships)
- [DOCKER.md](./DOCKER.md) — Docker Compose setup
- [GIT.md](./GIT.md) — Git workflow and branch naming
