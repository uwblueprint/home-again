import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Agency, Client, Referral
from ..schemas import ReferralCreate, ReferralUpdate


async def list_referrals(db: AsyncSession) -> list[Referral]:
    """Return all referrals ordered from newest to oldest."""
    result = await db.execute(select(Referral).order_by(Referral.created_at.desc()))
    return result.scalars().all()


async def get_referral(db: AsyncSession, referral_id: str) -> Referral | None:
    """Return a single referral by ID or None when not found."""
    result = await db.execute(select(Referral).where(Referral.id == referral_id))
    return result.scalar_one_or_none()


async def create_referral(db: AsyncSession, payload: ReferralCreate) -> Referral:
    """Create a referral after validating related records."""
    data = payload.model_dump(exclude_unset=True)
    await _validate_related_records(db, data)
    referral = Referral(**_prepare_payload(data))
    db.add(referral)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to create referral: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise

    await db.refresh(referral)
    return referral


async def update_referral(
    db: AsyncSession, referral: Referral, payload: ReferralUpdate
) -> Referral:
    """Update an existing referral with validated, normalized data."""
    data = payload.model_dump(exclude_unset=True)

    if not data:
        raise ValueError("No update fields were provided.")

    await _validate_related_records(db, data)

    for key, value in _prepare_payload(data).items():
        setattr(referral, key, value)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to update referral: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise

    await db.refresh(referral)
    return referral


async def delete_referral(db: AsyncSession, referral: Referral) -> None:
    """Delete an existing referral."""
    await db.delete(referral)

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise ValueError(f"Unable to delete referral: {str(e.orig)}") from e
    except Exception:
        await db.rollback()
        raise


def _prepare_payload(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize datetimes and serialize requested_items for persistence."""
    prepared = data.copy()

    if "requested_items" in prepared:
        prepared["requested_items"] = json.dumps(prepared["requested_items"])

    for key, value in prepared.items():
        if isinstance(value, datetime) and value.tzinfo is not None:
            prepared[key] = value.astimezone(timezone.utc).replace(tzinfo=None)

    return prepared


async def _validate_related_records(db: AsyncSession, data: dict[str, Any]) -> None:
    """Ensure related client and agency records exist when provided."""
    if "client_id" in data:
        client_id = data["client_id"]
        if client_id is None or client_id == "":
            raise ValueError(f"Client with ID '{client_id}' does not exist.")

        client_result = await db.execute(
            select(Client.id).where(Client.id == client_id)
        )
        if not client_result.scalar_one_or_none():
            raise ValueError(f"Client with ID '{data['client_id']}' does not exist.")

    if "agency_id" in data:
        agency_id = data["agency_id"]
        if agency_id is None or agency_id == "":
            raise ValueError(f"Agency with ID '{agency_id}' does not exist.")

        agency_result = await db.execute(
            select(Agency.id).where(Agency.id == agency_id)
        )
        if not agency_result.scalar_one_or_none():
            raise ValueError(f"Agency with ID '{data['agency_id']}' does not exist.")
