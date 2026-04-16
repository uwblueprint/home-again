# Backend Developer Guide

Patterns, conventions, and step-by-step instructions for working on the Home Again Furniture Bank backend.

## Architecture

The backend follows a four-layer pattern:

```
models/base.py      ORM models — database schema and relationships
enums.py            StrEnum constants for all categorical fields
schemas.py          Pydantic request/response schemas
services/{x}.py     Business logic — raises ValueError for domain errors
api/{x}.py          FastAPI routers — catches ValueError → HTTP 400
```

Each layer depends only on the layers above it. Routers never touch the database directly; services never import from routers.

---

## Canonical Service Pattern

```python
"""Widget service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Widget
from ..schemas import WidgetCreate, WidgetUpdate

logger = logging.getLogger(__name__)          # module-level logger, always


async def list_widgets(db: AsyncSession) -> list[Widget]:
    result = await db.execute(select(Widget).order_by(Widget.name))
    return result.scalars().all()


async def get_widget(db: AsyncSession, widget_id: str) -> Widget | None:
    result = await db.execute(select(Widget).where(Widget.id == widget_id))
    return result.scalar_one_or_none()


async def create_widget(db: AsyncSession, payload: WidgetCreate) -> Widget:
    db_widget = Widget(**payload.model_dump())
    db.add(db_widget)
    try:                                       # try wraps ONLY db.commit()
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating widget: %s", e.orig)
        raise ValueError(f"Unable to create widget: {str(e.orig)}") from e
    await db.refresh(db_widget)
    return db_widget


async def update_widget(db: AsyncSession, widget: Widget, payload: WidgetUpdate) -> Widget:
    data = payload.model_dump(exclude_unset=True)
    if not data:                               # always guard against empty PUT
        raise ValueError("No update fields were provided.")
    for key, value in data.items():
        setattr(widget, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating widget %s: %s", widget.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(widget)
    return widget


async def delete_widget(db: AsyncSession, widget: Widget) -> None:
    await db.delete(widget)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting widget %s: %s", widget.id, e.orig)
        raise ValueError(f"Unable to delete widget: {str(e.orig)}") from e
```

**Service rules:**
- `db: AsyncSession` is always the first parameter.
- `try` wraps **only** `await db.commit()` — never the full function body. Wrapping more would silently swallow `ValueError`s from FK validation above the commit.
- No bare `except Exception` — let unexpected exceptions propagate so they surface in logs.
- Every `except IntegrityError` block calls `logger.exception(...)`.
- Every `update_x` has an empty-update guard (`if not data: raise ValueError(...)`).
- For resources with FK dependencies, add a `_validate_fks(db, data)` private helper and call it before the insert/update (see `services/referrals.py` for the pattern).

---

## Canonical Router Pattern

```python
"""Widgets REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Widget
from ..schemas import Widget as WidgetSchema, WidgetCreate, WidgetUpdate
from ..services import widgets_service

router = APIRouter()


# FastAPI dependency — resolves {widget_id} from path, raises 404 if not found.
# Every router defines one of these; endpoints use Depends(get_widget_or_404).
async def get_widget_or_404(widget_id: str, db: AsyncSession = Depends(get_db)) -> Widget:
    widget = await widgets_service.get_widget(db, widget_id)
    if not widget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget not found")
    return widget


@router.get("", response_model=list[WidgetSchema])
async def list_widgets(db: AsyncSession = Depends(get_db)):
    return await widgets_service.list_widgets(db)


@router.post("", response_model=WidgetSchema, status_code=status.HTTP_201_CREATED)
async def create_widget(payload: WidgetCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await widgets_service.create_widget(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{widget_id}", response_model=WidgetSchema)
async def get_widget(widget: Widget = Depends(get_widget_or_404)):
    return widget


@router.put("/{widget_id}", response_model=WidgetSchema)
async def update_widget(
    payload: WidgetUpdate,
    widget: Widget = Depends(get_widget_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await widgets_service.update_widget(db, widget, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{widget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_widget(
    widget: Widget = Depends(get_widget_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await widgets_service.delete_widget(db, widget)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

**Router rules:**
- `get_X_or_404` is a FastAPI **dependency** (has `db: AsyncSession = Depends(get_db)` in its signature) — FastAPI injects the path param automatically, no `Depends` wrapper needed for the path param itself.
- Path param in the route string matches the dependency's param name: `{widget_id}` ↔ `widget_id: str`.
- Routers **never** import `IntegrityError` or handle DB exceptions — that belongs in services.
- Always return `Response(status_code=204)` explicitly on DELETE.
- Use `{resource_id}` consistently, not `{id}`.

---

## Enum Usage

All categorical fields use `StrEnum` constants from `backend/app/enums.py`. Use them:

**In models** (`models/base.py`) — as a comment pointing to the enum:
```python
status = Column(String(50), nullable=True)  # See FurnitureStatus
```

**In schemas** (`schemas.py`) — as the field type:
```python
from .enums import FurnitureStatus

class FurnitureBase(BaseModel):
    status: FurnitureStatus
```

To add a new enum value: edit `enums.py`, update any existing rows in a migration if needed.

---

## How to Add a New Resource

1. **`models/base.py`** — Add the ORM model class. UUID PK, timestamps, FKs with `ForeignKey(...)`, relationships with `back_populates`.

2. **`enums.py`** — Add any new `StrEnum` constants if the resource introduces categorical fields.

3. **`schemas.py`** — Add `XBase`, `XCreate`, `XUpdate`, and `X` (response). Use `ConfigDict(from_attributes=True)` on the response schema.

4. **Alembic migration** — `alembic revision --autogenerate -m "add widgets"`, then review and adjust the generated file.

5. **`services/widgets.py`** — Follow the canonical service pattern above. Add `_validate_fks` if there are FK fields.

6. **`services/__init__.py`** — Add `from . import widgets as widgets_service` and update `__all__`.

7. **`api/widgets.py`** — Follow the canonical router pattern above.

8. **`api/__init__.py`** — Import the router and add `router.include_router(widgets_router, prefix="/widgets", tags=["widgets"])`.

9. **`tests/test_widgets.py`** — Write tests (see Testing section below).

10. **`docs/SCHEMA.md`** — Add an entity section with fields table and relationships.

---

## Testing

Tests use an in-memory SQLite database — no external services needed.

### Running tests

```bash
cd backend

pytest tests/ -v                    # all tests
pytest tests/test_agencies.py -v    # single file
pytest -k test_create -v            # tests matching name
pytest tests/ -v --tb=short         # less verbose tracebacks
```

### Fixture overview (`tests/conftest.py`)

| Fixture | Scope | Purpose |
|---------|-------|---------|
| `engine` | session | Creates in-memory SQLite engine and runs `Base.metadata.create_all` once |
| `db_session` | function | Opens a session; rolls back after each test (tests are isolated) |
| `client` | function | `httpx.AsyncClient` with `get_db` overridden to use the test session |

### Writing a new test

```python
# tests/test_widgets.py
import pytest

WIDGET_BASE = {"name": "Gadget", "colour": "red"}

async def create_widget(client, **overrides):
    resp = await client.post("/api/widgets", json={**WIDGET_BASE, **overrides})
    assert resp.status_code == 201, resp.text
    return resp.json()

async def test_create_widget_valid(client):
    data = await create_widget(client)
    assert data["name"] == "Gadget"
    assert "id" in data

async def test_create_widget_missing_name(client):
    resp = await client.post("/api/widgets", json={"colour": "blue"})
    assert resp.status_code == 422
```

No `@pytest.mark.asyncio` needed — `pytest.ini` sets `asyncio_mode = auto`.

---

## Common Pitfalls

**Wrapping the full function body in `try`**
```python
# BAD — masks ValueError from FK validation
async def create_widget(db, payload):
    try:
        await _validate_fks(db, payload.model_dump())
        db_widget = Widget(...)
        db.add(db_widget)
        await db.commit()
    except IntegrityError as e:
        ...
```
```python
# GOOD — try wraps only the commit
async def create_widget(db, payload):
    await _validate_fks(db, payload.model_dump())
    db_widget = Widget(...)
    db.add(db_widget)
    try:
        await db.commit()
    except IntegrityError as e:
        ...
```

**Bare `except Exception` in services**
```python
# BAD — hides bugs, prevents proper error propagation
except Exception:
    await db.rollback()
    raise
```
Only catch `IntegrityError`. Let everything else propagate.

**Handling `IntegrityError` in routers**
```python
# BAD — routers should only catch ValueError
from sqlalchemy.exc import IntegrityError

@router.post(...)
async def create_widget(...):
    try:
        ...
    except IntegrityError:   # This belongs in the service
        ...
```

**Using `{id}` instead of `{resource_id}` in path params**
```python
# BAD
@router.get("/{id}", ...)

# GOOD
@router.get("/{widget_id}", ...)
```

**Forgetting the empty-update guard in `update_x`**
```python
# BAD — PUT {} returns 200 and does nothing
async def update_widget(db, widget, payload):
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        ...

# GOOD
async def update_widget(db, widget, payload):
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    ...
```

**Not using `get_X_or_404` as a FastAPI dependency**
```python
# BAD — manual lookup in every endpoint
@router.get("/{widget_id}")
async def get_widget(widget_id: str, db: AsyncSession = Depends(get_db)):
    widget = await widgets_service.get_widget(db, widget_id)
    if not widget:
        raise HTTPException(404, "not found")
    return widget

# GOOD — dependency is injected, reused by GET/PUT/DELETE
async def get_widget_or_404(widget_id: str, db: AsyncSession = Depends(get_db)) -> Widget:
    widget = await widgets_service.get_widget(db, widget_id)
    if not widget:
        raise HTTPException(404, "Widget not found")
    return widget

@router.get("/{widget_id}")
async def get_widget(widget: Widget = Depends(get_widget_or_404)):
    return widget
```
