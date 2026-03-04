# API documentation and architecture guide

This API is built with FastAPI and follows REST principles.

## Table of contents

- [Architecture Overview](#architecture-overview)
- [Adding New Endpoints](#adding-new-endpoints)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Database Migrations with Alembic](#database-migrations-with-alembic)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)

## Architecture Overview

### Technology Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL via SQLAlchemy 2.0
- **Authentication**: JWT tokens (via Supabase or custom)
- **Type Safety**: Pydantic 2.0 for schema validation

### Project Structure

```
app/
├── main.py           # FastAPI app factory
├── config.py         # Configuration management (pydantic settings)
├── database.py       # Database engine and session management
├── schemas.py        # Pydantic models for validation and OpenAPI docs
├── models/
│   ├── base.py      # SQLAlchemy ORM models
│   └── __init__.py  # Model exports
└── api/
    ├── __init__.py  # Main router combining all resources
    ├── agencies.py   # Agency CRUD endpoints
    ├── donors.py     # Donor CRUD endpoints
    ├── clients.py    # Client CRUD endpoints
    ├── furniture.py  # Furniture CRUD endpoints
    ├── referrals.py  # Referral CRUD endpoints
    └── routes.py    # Route (dispatch) CRUD endpoints
```

### Key Design Decisions

#### 1. Async/Await with SQLAlchemy

All database operations use async patterns for non-blocking I/O:

```python
@router.get("", response_model=list[AgencySchema])
async def list_agencies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agency))
    return result.scalars().all()
```

#### 2. Dependency Injection

FastAPI's dependency injection provides:
- Database session management
- Automatic cleanup
- Easy to test

```python
async def list_agencies(db: AsyncSession = Depends(get_db)):
    # db is automatically provided and cleaned up
```

#### 3. Pydantic Schemas

Request/response validation in one place:
- Automatic OpenAPI documentation
- Type-safe client code generation
- Clear API contracts

#### 4. RESTful Design

Resources map to standard HTTP verbs:
- GET /agencies → list agencies
- POST /agencies → create agency
- GET /agencies/{id} → get agency
- PUT /agencies/{id} → update agency
- DELETE /agencies/{id} → delete agency

### Adding New Endpoints

1. **Create the SQLAlchemy Model** in `models/base.py`:

```python
class MyResource(Base):
    __tablename__ = "my_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

2. **Create Pydantic Schemas** in `schemas.py` (use `ConfigDict(from_attributes=True)` for response schemas):

```python
from pydantic import BaseModel, ConfigDict

class MyResourceBase(BaseModel):
    name: str

class MyResourceCreate(MyResourceBase):
    pass

class MyResource(MyResourceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

3. **Create the Router** in `api/my_resources.py` (copy the pattern from `api/agencies.py`):

```python
from fastapi import APIRouter, Depends
from ..database import get_db
from ..models import MyResource
from ..schemas import MyResourceCreate, MyResource as MyResourceSchema

router = APIRouter()

@router.post("", response_model=MyResourceSchema, status_code=status.HTTP_201_CREATED)
async def create_resource(payload: MyResourceCreate, db: AsyncSession = Depends(get_db)):
    db_row = MyResource(**payload.model_dump())
    db.add(db_row)
    await db.commit()
    await db.refresh(db_row)
    return db_row
```

4. **Register the Router** in `api/__init__.py`:

```python
from .my_resources import router as my_resources_router
router.include_router(my_resources_router, prefix="/my-resources", tags=["my-resources"])
```

### Error Handling

FastAPI automatically converts exceptions to appropriate HTTP responses:

```python
from fastapi import HTTPException, status

@router.get("/{id}")
async def get_agency(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agency).where(Agency.id == id))
    agency = result.scalar_one_or_none()
    
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agency with id {id} not found"
        )
    
    return agency
```

### Testing

FastAPI provides a test client for easy testing:

```python
from fastapi.testclient import TestClient
from app.main import create_app

client = TestClient(create_app())

def test_create_agency():
    response = client.post("/api/agencies", json={
        "name": "Test Agency",
        "email": "test@example.com",
        "phone": "555-1234",
        "address": "123 Main St",
        "city": "Toronto",
        "province": "ON"
    })
    assert response.status_code == 201
    assert response.json()["name"] == "Test Agency"
```

### Database Migrations with Alembic

Initialize migrations (already done):
```bash
alembic init migrations
```

Create a migration after model changes:
```bash
alembic revision --autogenerate -m "Add new column"
alembic upgrade head
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

The documentation is automatically generated from your Pydantic schemas and function signatures.

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `API_HOST`, `API_PORT`: Server address
- `DEBUG`: Enable debug logging
- `SECRET_KEY`: For JWT tokens (CHANGE IN PRODUCTION)
