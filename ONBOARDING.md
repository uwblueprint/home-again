# Developer Onboarding Guide

Welcome to Home Again Furniture Bank! This guide will get you up and running in about 15 minutes.

## Prerequisites

Make sure you have installed:

- **Node.js 20+**: [Download](https://nodejs.org/)
- **Python 3.9+**: [Download](https://www.python.org/downloads/)
- **PostgreSQL 12+**: [Download](https://www.postgresql.org/download/) (or use Supabase)
- **Git**: [Download](https://git-scm.com/)
- **Docker** (optional): [Download](https://www.docker.com/products/docker-desktop)

Verify:
```bash
node --version    # v20.0.0 or higher
python --version  # 3.9 or higher
git --version     # 2.0 or higher
```

## Getting Started

### Option A: Docker (fastest)

```bash
cd home-again
docker-compose up --build
```

Open http://localhost:3000 (frontend) and http://localhost:8000/docs (API docs). The database is created and migrated automatically. See [DOCKER.md](DOCKER.md) for more.

### Option B: Local install

#### Step 1: Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at http://localhost:3000.

#### Step 2: Backend

Open a new terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python3 server.py
```

Backend runs at http://localhost:8000. API docs at http://localhost:8000/docs.

#### Step 3: Database

```bash
createdb hafb
createdb hafb_test

cd backend
alembic upgrade head
```

The Agencies resource is fully implemented (backend + frontend). Other resources (Donors, Clients, Inventory, Referrals, Deliveries) have routers registered but return 501 until you implement them. See [backend/STARTER_BACKEND_GUIDE.md](backend/STARTER_BACKEND_GUIDE.md).

## Understanding the Project

### Quick Tour

1. **Visit the app**: http://localhost:3000
2. **Explore the API**: http://localhost:8000/docs — try endpoints interactively
3. **Read the docs**: `ARCHITECTURE.md` for system design, `backend/API_GUIDE.md` for backend patterns

### Project Structure

```
home-again/
├── frontend/          # Next.js React app
│   ├── app/           # Pages (file-based routing)
│   ├── components/    # Reusable UI components
│   ├── hooks/         # API hooks (TanStack Query)
│   ├── stores/        # Global state (Zustand)
│   ├── lib/           # apiClient.ts, supabase.ts
│   ├── types/         # TypeScript types
│   ├── constants/     # Routes, config, auth constants
│   └── utils/         # Utility functions
├── backend/           # FastAPI REST API
├── e2e-tests/         # End-to-end tests
└── docker-compose.yml
```

### Tech Stack at a Glance

| What | Technology |
|------|-----------|
| Frontend Framework | Next.js 15 |
| Frontend Language | TypeScript 5 |
| Frontend State | Zustand + TanStack Query |
| Frontend Styling | Tailwind CSS |
| Backend Framework | FastAPI |
| Backend Language | Python 3.9+ |
| Database | PostgreSQL / Supabase |
| ORM | SQLAlchemy 2.0 |

## Common Tasks

### Add a Frontend Component

Create `frontend/components/MyComponent.tsx`:

```typescript
"use client";

import { useAgencies } from "@/hooks/useApi";

export function MyComponent() {
  const { data: agencies, isLoading } = useAgencies();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {agencies?.map((agency) => (
        <div key={agency.id}>{agency.name}</div>
      ))}
    </div>
  );
}
```

Use it in a page (`frontend/app/page.tsx`):

```typescript
import { MyComponent } from "@/components/MyComponent";

export default function Home() {
  return <MyComponent />;
}
```

### Add a Backend Endpoint

1. Add model in `backend/app/models/base.py`
2. Add schema in `backend/app/schemas.py`
3. Create router in `backend/app/api/my_resource.py`
4. Register in `backend/app/api/__init__.py`
5. Test at http://localhost:8000/docs

See [backend/API_GUIDE.md](backend/API_GUIDE.md) for a detailed walkthrough.

### Running Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
pytest -v
pytest -v --tb=short      # Less verbose
pytest -k test_create     # Run specific test

# End-to-end
cd e2e-tests
pytest -v
```

### Linting & Formatting

```bash
# Frontend
cd frontend
npm run lint          # Check
npm run lint:fix      # Auto-fix
npm run format        # Prettier

# Backend
cd backend
black .               # Format with Black
isort .               # Sort imports
```

## Understanding State Management

```typescript
// Local state — stays in this component
function SearchForm() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// Global client state — auth, UI flags (Zustand)
function UserButton() {
  const { user, logout } = useAuthStore();
  return <button onClick={logout}>{user?.email}</button>;
}

// Server state — data from API (TanStack Query)
function AgenciesList() {
  const { data: agencies } = useAgencies();
  // Automatically fetches, caches, and refetches on focus
  return agencies?.map((a) => <div key={a.id}>{a.name}</div>);
}
```

## API Integration Pattern

All API calls go through typed hooks in `frontend/hooks/useApi.ts`:

```typescript
export function useAgencies() {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const response = await apiClient.get<Agency[]>("/agencies");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateAgency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agency: AgencyCreate) =>
      apiClient.post<Agency>("/agencies", agency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
    },
  });
}
```

Use in components:

```typescript
function CreateAgencyForm() {
  const { mutate, isPending } = useCreateAgency();
  // ...
}
```

## Useful Commands Reference

### Frontend

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Check code style
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format with Prettier
npm test              # Run tests
```

### Backend

```bash
python server.py              # Start development server
pytest                        # Run all tests
pytest -v                     # Verbose
pytest tests/unit/test_csv.py # Specific file
black .                       # Format code
isort .                       # Sort imports
alembic upgrade head          # Apply migrations
alembic revision --autogenerate -m "msg"  # New migration
```

### Docker

```bash
docker-compose up --build        # Build and start
docker-compose up -d             # Background
docker-compose down              # Stop
docker-compose logs -f           # Follow logs
docker-compose exec py-backend alembic upgrade head  # Run migrations
```

### Git Workflow

```bash
git checkout -b feature/add-trucks
git add .
git commit -m "feat: add trucks resource"
git push origin feature/add-trucks
# Open pull request on GitHub
```

## Debugging Tips

### Frontend

```bash
rm -rf .next                              # Clear Next.js cache
rm -rf node_modules && npm install        # Reinstall dependencies
lsof -i :3000                             # Check if port is in use
```

### Backend

```bash
pip install --upgrade -r requirements.txt
psql $DATABASE_URL -c "SELECT 1"          # Test DB connection
lsof -i :8000
```

### Database

```bash
# Can't connect?
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Reset database
dropdb hafb && createdb hafb
cd backend && alembic upgrade head
```

## Code Style Guidelines

### Python

```python
# ✅ Good
async def create_agency(agency: AgencyCreate, db: AsyncSession) -> Agency:
    """Create a new agency."""
    db_agency = Agency(**agency.model_dump())
    db.add(db_agency)
    await db.commit()
    return db_agency

# ❌ Bad
def create_agency(a, db):
    x = Agency(**a.dict())
    db.add(x)
    db.commit()
    return x
```

- Use type hints everywhere
- Write docstrings on public functions
- Follow PEP 8
- Keep functions under 20 lines

### TypeScript

```typescript
// ✅ Good
interface Agency {
  id: string;
  name: string;
}

function AgencyCard({ agency }: { agency: Agency }) {
  return <div>{agency.name}</div>;
}

// ❌ Bad
function AgencyCard({ a }: { a: any }) {
  return <div>{a.name}</div>;
}
```

- No `any` types
- Explicit interfaces for all data shapes
- Keep components under 100 lines
- Add `"use client"` only when needed (hooks, browser APIs)

## Documentation Reference

- **[README.md](README.md)** — Project overview and quick start
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Complete system design
- **[DOCKER.md](DOCKER.md)** — Docker setup and configuration
- **[backend/API_GUIDE.md](backend/API_GUIDE.md)** — Backend development patterns
- **[backend/STARTER_BACKEND_GUIDE.md](backend/STARTER_BACKEND_GUIDE.md)** — Implementing remaining resources

## Next Steps

1. ✅ Get the local environment running
2. ✅ Browse http://localhost:3000 and http://localhost:8000/docs
3. ✅ Read ARCHITECTURE.md
4. ✅ Trace one feature end-to-end (Agencies: model → schema → endpoint → hook → page)
5. ✅ Implement a new resource following the Agencies pattern
6. ✅ Write a test

## Welcome! 🎉

You're ready to start developing. Happy coding!

---

**Questions?** Check ARCHITECTURE.md or ask your team lead.
**Found an issue in the docs?** Please fix it — the next developer will thank you.