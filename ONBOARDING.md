# Developer Onboarding Guide

Welcome to Home Again Furniture Bank! This guide will help you get up and running quickly.

## Prerequisites

Before you start, make sure you have installed:

- **Node.js 18+**: [Download](https://nodejs.org/)
- **Python 3.9+**: [Download](https://www.python.org/downloads/)
- **PostgreSQL 12+**: [Download](https://www.postgresql.org/download/) (or use Supabase)
- **Git**: [Download](https://git-scm.com/)
- **Docker** (optional): [Download](https://www.docker.com/products/docker-desktop)

Verify installations:
```bash
node --version    # v18.0.0 or higher
python --version  # 3.9 or higher
git --version     # 2.0 or higher
```

## Getting Started (15 minutes)

### Option A: Docker (fastest)

If you have Docker and Docker Compose:

```bash
cd /path/to/home-again
docker-compose up --build
```

Then open http://localhost:3000 (frontend) and http://localhost:8000/docs (API docs). The database is created and migrated automatically. See [README.md - Docker](README.md#docker) for more.

### Option B: Local install

### Step 1: Clone & Navigate

```bash
cd /path/to/home-again
```

### Step 2: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend runs at http://localhost:3000

### Step 3: Setup Backend

Open a new terminal:

```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Start development server
python server.py
```

Backend runs at http://localhost:8000

The Agencies resource is fully implemented (backend and frontend). Other
resources (Donors, Clients, Inventory, Referrals, Deliveries) have routers
registered but return 501 until you implement them. See
`backend/STARTER_BACKEND_GUIDE.md`.

### Step 4: Setup Database

Open a new terminal:

```bash
# Create databases
createdb hafb
createdb hafb_test

# If using Postgres via Homebrew on Mac:
# brew services start postgresql
```

That's it! You now have:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Understanding the Project

### Quick Tour

1. **Visit the app**: http://localhost:3000
   - You should see the home page

2. **Explore the API**: http://localhost:8000/docs
   - Interactive API documentation
   - Try out endpoints there

3. **Read the docs**:
   - `README.md` - Project overview
   - `ARCHITECTURE.md` - System design details
   - `backend/API_GUIDE.md` - Backend patterns

### Project Structure

```
home-again/
├── frontend/          # React app with Next.js
├── backend/    # REST API with FastAPI
├── README.md          # Quick start
├── ARCHITECTURE.md    # Full system design
└── docker-compose.yml # Multi-container setup
```

### Tech Stack at a Glance

| What | Technology | Version |
|------|-----------|---------|
| Frontend Framework | Next.js | 15.0.0 |
| Frontend State | Zustand + TanStack Query | Latest |
| Frontend Language | TypeScript | 5.6 |
| Frontend Styling | Tailwind CSS | 3.4.0 |
| Backend Framework | FastAPI | 0.115.0 |
| Backend Language | Python | 3.9+ |
| Database | PostgreSQL | 12+ |
| Server | Uvicorn | 0.30.0 |
| Testing | pytest (backend), Jest (frontend) | Latest |

## Common Tasks

### Making Your First Change

#### Add a Frontend Component

1. Create `frontend/src/components/MyComponent.tsx`:

```typescript
"use client"; // If using hooks

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

2. Use it in a page (`frontend/app/page.tsx`):

```typescript
import { MyComponent } from "@/components/MyComponent";

export default function Home() {
  return <MyComponent />;
}
```

#### Add a Backend Endpoint

1. Add model in `backend/app/models/base.py`
2. Add schema in `backend/app/schemas.py`
3. Create router in `backend/app/api/my_resource.py`
4. Register in `backend/app/api/__init__.py`
5. Test at http://localhost:8000/docs

See [API_GUIDE.md](backend/API_GUIDE.md) for detailed example.

### Running Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
pytest -v
pytest -v --tb=short  # Less verbose
pytest -k test_create  # Run specific test
```

### Formatting Code

```bash
# Frontend
cd frontend
npm run format        # Format code with Prettier
npm run lint         # Check code style

# Backend
cd backend
black .              # Format with Black
isort .              # Sort imports
```

### Using Docker

```bash
# Build and start everything
docker-compose up --build

# Stop everything
docker-compose down

# View logs
docker-compose logs -f py-backend
```

## Useful Commands Reference

### Frontend (Next.js)

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Check code style
npm run format    # Format code
npm test          # Run tests
npm run type-check # Check TypeScript
```

### Backend (FastAPI)

```bash
python server.py              # Start development server
pytest                        # Run all tests
pytest -v                     # Verbose output
pytest tests/test_agencies.py # Run specific test file
black .                       # Format Python code
isort .                       # Sort imports
```

### Database (PostgreSQL)

```bash
createdb hafb                    # Create development database
dropdb hafb                      # Delete database
psql hafb -c "SELECT 1"         # Test connection
psql hafb -f migrations/init.sql # Run migration script

# In PSQL interactive mode:
\dt                  # List tables
\d agencies          # Describe table
SELECT * FROM agencies;  # Query data
\q                   # Quit
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-trucks

# Make changes and commit
git add .
git commit -m "feat: add trucks resource"

# Push to remote
git push origin feature/add-trucks

# Create pull request on GitHub
# After review/approval, merge to main
```

## Understanding State Management

### Where State Lives

```typescript
// Local State - stays in this component
function SearchForm() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// Global Client State - auth, UI (Zustand)
function UserButton() {
  const { user, logout } = useAuthStore();
  return <button onClick={logout}>{user?.email}</button>;
}

// Server State - data from API (TanStack Query)
function AgenciesList() {
  const { data: agencies } = useAgencies(); // useQuery hook
  return agencies?.map((a) => <div key={a.id}>{a.name}</div>);
}
```

## API Integration Pattern

All API calls go through typed hooks:

```typescript
// frontend/src/hooks/useApi.ts

export function useAgencies() {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const response = await apiClient.get<Agency[]>("/agencies");
      return response.data;
    },
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

Then use in components:

```typescript
function CreateAgencyForm() {
  const { mutate, isPending } = useCreateAgency();
  const onSubmit = (data: AgencyCreate) => {
    mutate(data);
  };
  // ...
}
```

## Debugging Tips

### Frontend Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is in use
lsof -i :3000
```

### Backend Issues

```bash
# Reinstall Python dependencies
pip install --upgrade -r requirements.txt

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Reset database
dropdb hafb
createdb hafb

# Check if port 8000 is in use
lsof -i :8000
```

### Database Issues

```bash
# Can't connect to Postgres
# Check if service is running
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Shows permission denied
# Check credentials in .env file

# Want to reset everything
dropdb hafb
createdb hafb
# Restart backend to auto-migrate
```

## Documentation Reference

### Within This Project

- **README.md** - Project overview and quick start
- **ARCHITECTURE.md** - Complete system design
- **API_GUIDE.md** - Backend development patterns

### External Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **TanStack Query**: https://tanstack.com/query/latest
- **Zustand**: https://zustand.docs.pmnd.rs/
- **Pydantic**: https://docs.pydantic.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/

## Code Style Guidelines

### Python (Backend)

```python
# ✅ Good
def create_agency(agency: AgencyCreate, db: AsyncSession) -> Agency:
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

Guidelines:
- Use type hints for all functions
- Write docstrings for functions
- Follow [PEP 8](https://pep8.org/)
- Keep functions under 20 lines
- Use descriptive variable names

### TypeScript (Frontend)

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

Guidelines:
- Use explicit types (no `any`)
- Use descriptive component names
- Keep components under 100 lines
- Use TypeScript strict mode


## Next Steps

1. ✅ Get the local environment running
2. ✅ Review README.md and ARCHITECTURE.md
3. ✅ Make a small change (add a component)
4. ✅ Study one complete feature end-to-end
5. ✅ Check out the API documentation
6. ✅ Write a test
7. ✅ Contribute a new feature!

## Welcome! 🎉

You're ready to start developing. The team is here to help if you have questions. Happy coding!

---

**Questions?** Check ARCHITECTURE.md for detailed explanations or ask your team lead.

**Found an issue?** Please update documentation so the next developer doesn't get stuck!
