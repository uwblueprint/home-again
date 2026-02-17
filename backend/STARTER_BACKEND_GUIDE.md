# Starter Backend Guide

## Purpose

This guide explains the backend foundation and how to implement new resource endpoints on top of it.

## Goals

- Keep models and Pydantic schemas as the data foundation.
- Provide one full reference implementation (Agencies) and placeholder routers for the rest.
- Give clear patterns so teams can implement CRUD for Donors, Clients, Inventory, Referrals, and Deliveries.

## What’s in place

- **Agencies**: Full CRUD at `/api/agencies` (list, create, get, update, delete). Use this as the reference.
- **Donors, Clients, Inventory, Referrals, Deliveries**: Routers are registered at `/api/donors`, `/api/clients`, etc., but return 501 until you implement them.

All routers are mounted in `app/api/__init__.py`. OpenAPI docs at `/docs` list every route.

## Implementing a new resource (e.g. Donors)

### 1. Model and schemas

Models live in `app/models/base.py`, schemas in `app/schemas.py`. They already exist for Donors, Clients, etc.

### 2. Implement the router

Copy the pattern from `app/api/agencies.py`:

- `get_db` and `AsyncSession` for database access.
- `select(Model).where(...)` and `result.scalars().all()` or `scalar_one_or_none()`.
- Pydantic schemas for request/response (`DonorCreate`, `DonorUpdate`, `Donor`).
- `HTTPException(status_code=404)` when a resource is not found.
- For create: `Model(**payload.model_dump())`, `db.add()`, `commit()`, `refresh()`.
- For update: load entity, `model_dump(exclude_unset=True)`, `setattr` loop, then `commit()` and `refresh()`.
- For delete: load entity, `db.delete()`, `commit()`.

### 3. Register the router

Routers are already included in `app/api/__init__.py`. Replace the placeholder implementation in `app/api/donors.py` (and similarly for other resources) with real CRUD using the Agencies pattern.

### 4. Referral requestedItems

The `Referral` model stores `requestedItems` as a JSON string (Text). When creating a referral, serialize the list to JSON before saving; the Pydantic schema already parses it when loading from the ORM.

## Running and testing

```bash
cd backend
python server.py
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

Use the Swagger UI at `/docs` to try Agencies and, after implementing them, other resources.

