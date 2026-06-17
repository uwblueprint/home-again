# Vercel & Preview Deployments

## What is Vercel

Vercel is the frontend hosting platform for the Home Again Furniture Bank (HAFB) project. It builds and serves the Next.js application on the internet, handling everything from SSL certificates to global CDN distribution.

The Vercel project is configured to build only the `frontend/` subdirectory of this monorepo. Key settings (configured via the Vercel dashboard):

| Setting | Value |
|---------|-------|
| Root Directory | `frontend/` |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm ci` |
| Node.js Version | 20.x |

No `vercel.json` file is needed — all configuration lives in the Vercel dashboard.

---

## GitHub Integration

Connecting this repository to Vercel enables automatic preview deployments on every pull request:

1. A developer opens or updates a PR against `main`.
2. Vercel receives a GitHub webhook and kicks off a build (`npm ci && next build` inside `frontend/`).
3. On success, Vercel posts a unique preview URL as a deployment status check on the PR.
4. Reviewers, designers, and stakeholders can click the URL to interact with the UI — no local setup required.

If the build fails, Vercel posts a failed status check with a link to the build logs.

Preview deployments remain accessible after the PR is merged or closed (for at least 30 days) but receive no further updates.

---

## Why MSW?

**The problem:** The FastAPI backend and Supabase database are still being built. Without a live API, preview deployments would show error states and broken loading indicators — making them useless for design review or stakeholder feedback.

**The solution:** MSW (Mock Service Worker) intercepts all API calls at the service worker level and returns realistic fixture data. Previews render fully populated pages that look and behave like the real application.

**Why MSW over alternatives:**

- **Zero production code changes** — MSW runs entirely in the browser via a service worker. No stub servers, no conditional API logic, no CORS configuration.
- **Automatic deactivation** — When a real backend URL is configured, MSW never initializes. The activation guard is a simple URL check, not a feature flag.
- **Type-safe fixtures** — Fixture data is written in TypeScript and validated against domain types at compile time. If types change, the build fails.

---

## How the Mock Layer Works

The end-to-end flow in a preview deployment:

```
Page Load
    │
    ▼
MswProvider (client component)
    │  checks NEXT_PUBLIC_API_URL === "https://mock.api.placeholder"
    │
    ▼
initMocks() → dynamically imports MSW browser worker → worker.start()
    │
    ▼
Service Worker registered in the browser
    │
    ▼
apiClient (axios) makes request to https://mock.api.placeholder/agencies
    │
    ▼
MSW Service Worker intercepts the request
    │
    ├─ Handler found → returns fixture JSON (HTTP 200)
    │
    └─ No handler found → catch-all returns empty JSON (HTTP 200)
                          + logs warning to console
```

**Activation guard:** MSW only activates when:

```
NEXT_PUBLIC_API_URL === "https://mock.api.placeholder"
```

For any other value (including `undefined`), MSW stays dormant and the `apiClient` makes requests directly to the configured backend.

**No network leakage:** A catch-all handler (`http.all("${MOCK_API_URL}/*")`) is registered last in the handler list. Any API request without a specific handler gets an empty `200 {}` response and a console warning. Non-API requests (Next.js assets, images, etc.) bypass MSW entirely via `onUnhandledRequest: "bypass"`.

---

## Mock Data in Previews

When `NEXT_PUBLIC_API_URL` is set to `https://mock.api.placeholder` (the default for Vercel preview environments), MSW intercepts HTTP requests from the `apiClient` and returns fixture data. Handlers support full CRUD (GET list, GET by ID, POST, PUT, DELETE) with in-session persistence — data you create via POST is retained in memory and returned by subsequent GET requests until the page is fully refreshed.

Covered endpoints:

- `/agencies` → 3+ agency records (full CRUD with session persistence)
- `/agents` → created on demand (full CRUD with session persistence)
- `/clients` → 3+ client records (full CRUD)
- `/donations` → 3+ donation records (full CRUD)
- `/donors` → 3+ donor records (full CRUD with session persistence)
- `/furniture` → 5+ furniture records, 3+ distinct statuses (full CRUD)
- `/referrals` → 3+ referral records, 2+ distinct statuses (full CRUD)
- `/routes` → 2+ route records (full CRUD)

All fixture data conforms to the TypeScript types in `frontend/common/types/` and is validated at build time.

---

## Switching to a Live Backend

When the backend is operational, update these environment variables in the Vercel project settings (Settings → Environment Variables):

| Variable | Current (Preview) | Live Value |
|----------|-------------------|------------|
| `NEXT_PUBLIC_API_URL` | `https://mock.api.placeholder` | Your FastAPI backend URL (e.g., `https://api.homeagain.org`) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mock.supabase.placeholder` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `mock-anon-key-placeholder` | Your Supabase anon/public key |

**No code changes required.** Once `NEXT_PUBLIC_API_URL` points to a real URL, MSW stays dormant and the application communicates directly with the backend. Redeploy or push a new commit to pick up the new values.

You can scope variables per environment (Preview, Production, Development) to keep mock mode active on previews while production hits the real backend.

---

## Adding Mock Data

### File locations

- **Fixtures** (static response data): `frontend/mocks/fixtures/`
- **Handlers** (URL-to-fixture mapping): `frontend/mocks/handlers/`
- **Barrel file** (aggregates all handlers): `frontend/mocks/handlers.ts`

### Currently covered entities

All 8 entities have fixtures and/or handlers with full CRUD support:

1. Agencies (with session persistence)
2. Agents (with session persistence)
3. Clients
4. Donations
5. Donors (with session persistence)
6. Furniture
7. Referrals
8. Routes

### Steps to add a new endpoint

1. **Create a fixture file** at `frontend/mocks/fixtures/<entity>.ts`:
   ```typescript
   import type { YourType } from "@/common/types";

   export const yourEntities: YourType[] = [
     { /* record 1 */ },
     { /* record 2 */ },
   ];
   ```

2. **Create a handler file** at `frontend/mocks/handlers/<entity>.ts`:
   ```typescript
   import { http, HttpResponse } from "msw";
   import { yourEntities } from "../fixtures/<entity>";

   const BASE = process.env.NEXT_PUBLIC_API_URL;

   export const yourEntityHandlers = [
     http.get(`${BASE}/<entity>`, () => {
       return HttpResponse.json(yourEntities);
     }),
   ];
   ```

3. **Register the handler** in `frontend/mocks/handlers.ts`:
   ```typescript
   import { yourEntityHandlers } from "./handlers/<entity>";

   export const handlers = [
     // ... existing handlers
     ...yourEntityHandlers,
     fallbackHandler, // keep this last
   ];
   ```

4. **Run `npm run type-check`** to confirm your fixture data matches the type definitions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                        │
│                     (home-again monorepo)                       │
├────────────────────────────┬────────────────────────────────────┤
│        frontend/           │           backend/                 │
│      (Next.js app)         │         (FastAPI app)              │
└────────────┬───────────────┴──────────────────┬─────────────────┘
             │                                  │
             ▼                                  ▼
┌─────────────────────────┐        ┌──────────────────────────────┐
│        Vercel           │        │       Docker Compose         │
│  (Frontend Hosting)     │        │     (Local Development)      │
│                         │        │                              │
│  • Builds frontend/     │        │  ┌────────────────────────┐  │
│  • Preview URLs per PR  │        │  │   FastAPI Backend      │  │
│  • Production deploys   │        │  │   (Python, Uvicorn)    │  │
│  • Env var management   │        │  └───────────┬────────────┘  │
│                         │        │              │               │
└─────────────────────────┘        │              ▼               │
                                   │  ┌────────────────────────┐  │
                                   │  │      Supabase          │  │
                                   │  │  (PostgreSQL + Auth)   │  │
                                   │  └────────────────────────┘  │
                                   └──────────────────────────────┘

Preview Deployment Flow:
────────────────────────
PR opened → Vercel webhook → npm ci && next build → Preview URL posted on PR

Mock Mode (Preview):
────────────────────
apiClient → MSW Service Worker → Fixture JSON (no network calls)

Live Mode (Production):
───────────────────────
apiClient → FastAPI Backend → Supabase (PostgreSQL)
```
