"""Referral service layer."""

import json
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Agent, Client, Referral
from ..schemas import ReferralCreate, ReferralUpdate

logger = logging.getLogger(__name__)


async def list_referrals(db: AsyncSession) -> list[Referral]:
    result = await db.execute(select(Referral).order_by(Referral.created_at.desc()))
    return result.scalars().all()


async def get_referral(db: AsyncSession, referral_id: str) -> Referral | None:
    result = await db.execute(select(Referral).where(Referral.id == referral_id))
    return result.scalar_one_or_none()


async def create_referral(db: AsyncSession, payload: ReferralCreate) -> Referral:
    data = payload.model_dump()
    await _validate_fks(db, data)
    referral = Referral(**_prepare_payload(data))
    db.add(referral)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating referral: %s", e.orig)
        raise ValueError(f"Unable to create referral: {str(e.orig)}") from e
    await db.refresh(referral)
    return referral


async def update_referral(
    db: AsyncSession, referral: Referral, payload: ReferralUpdate
) -> Referral:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    await _validate_fks(db, data)
    for key, value in _prepare_payload(data).items():
        setattr(referral, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating referral %s: %s", referral.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(referral)
    return referral


async def delete_referral(db: AsyncSession, referral: Referral) -> None:
    await db.delete(referral)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting referral %s: %s", referral.id, e.orig)
        raise ValueError(f"Unable to delete referral: {str(e.orig)}") from e


def _prepare_payload(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize datetimes and serialize requested_items for persistence."""
    prepared = data.copy()
    if "requested_items" in prepared:
        prepared["requested_items"] = json.dumps(prepared["requested_items"])
    for key, value in list(prepared.items()):
        if isinstance(value, datetime) and value.tzinfo is not None:
            prepared[key] = value.astimezone(timezone.utc).replace(tzinfo=None)
    return prepared


async def _validate_fks(db: AsyncSession, data: dict[str, Any]) -> None:
    """Raise ValueError if any provided FK references a non-existent record."""
    if "client_id" in data and data["client_id"]:
        result = await db.execute(select(Client.id).where(Client.id == data["client_id"]))
        if not result.scalar_one_or_none():
            raise ValueError(f"Client with ID '{data['client_id']}' does not exist.")

    if "agent_id" in data and data["agent_id"]:
        result = await db.execute(select(Agent.id).where(Agent.id == data["agent_id"]))
        if not result.scalar_one_or_none():
            raise ValueError(f"Agent with ID '{data['agent_id']}' does not exist.")

    if "secondary_agent_id" in data and data["secondary_agent_id"]:
        result = await db.execute(
            select(Agent.id).where(Agent.id == data["secondary_agent_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Agent with ID '{data['secondary_agent_id']}' does not exist."
            )
