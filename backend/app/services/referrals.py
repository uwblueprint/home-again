"""Referral service layer."""

import json
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..enums import ReferralItemStatus, ReferralReviewStatus, ReferralStatus
from ..models import Agent, Client, Referral, ReferralItem
from ..schemas import ReferralCreate, ReferralUpdate
from . import dropoffs as dropoffs_service

logger = logging.getLogger(__name__)


async def list_referrals(
    db: AsyncSession, client_id: str | None = None
) -> list[Referral]:
    query = (
        select(Referral)
        .order_by(Referral.created_at.desc())
        .options(selectinload(Referral.items))
    )
    if client_id:
        query = query.where(Referral.client_id == client_id)
    result = await db.execute(query)
    return result.scalars().all()


async def get_referral(db: AsyncSession, referral_id: str) -> Referral | None:
    """A referral with its items loaded (async sessions can't lazy-load)."""
    result = await db.execute(
        select(Referral)
        .where(Referral.id == referral_id)
        .options(selectinload(Referral.items))
        .execution_options(populate_existing=True)
    )
    return result.scalar_one_or_none()


async def create_referral(db: AsyncSession, payload: ReferralCreate) -> Referral:
    data = payload.model_dump()
    await _validate_fks(db, data)
    _check_rejection(data, data["status"])
    referral = Referral(**_prepare_payload(data))
    referral.items = build_items(data["requested_items"])
    db.add(referral)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating referral: %s", e.orig)
        raise ValueError(f"Unable to create referral: {str(e.orig)}") from e
    return await get_referral(db, referral.id)


async def update_referral(
    db: AsyncSession, referral: Referral, payload: ReferralUpdate
) -> Referral:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    await _validate_fks(db, data)
    status = data.get("status") or referral.status
    _check_rejection(data, status)
    if (
        status == ReferralStatus.DECLINED
        and referral.status != ReferralStatus.DECLINED.value
    ):
        await _close_items(db, referral)
    elif (
        status != ReferralStatus.DECLINED
        and referral.status == ReferralStatus.DECLINED.value
    ):
        _reopen_items(referral)
    if status != ReferralStatus.DECLINED:
        # A referral moved out of rejected no longer has a rejection reason.
        data["rejection_reason"] = None
        data["rejection_details"] = None
    if data.get("requested_items") is not None:
        # The items are rebuilt from the request, which would throw away any
        # review decisions already made.
        if any(
            item.status != ReferralItemStatus.PENDING_REVIEW for item in referral.items
        ):
            raise ValueError("Requested items can't change once review has started.")
        referral.items = build_items(data["requested_items"])
    for key, value in _prepare_payload(data).items():
        setattr(referral, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating referral %s: %s", referral.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    return await get_referral(db, referral.id)


async def delete_referral(db: AsyncSession, referral: Referral) -> None:
    """
    Delete a referral and its items. Open drop-offs are cancelled first; a
    referral with a delivered item is kept as the record of that delivery.
    """
    if any(
        item.status == ReferralItemStatus.DELIVERED.value for item in referral.items
    ):
        raise ValueError("This referral has delivered items, so it can't be deleted.")
    for item in referral.items:
        dropoff = await dropoffs_service.get_item_dropoff(db, item.id)
        if dropoff is not None:
            await dropoffs_service.release_dropoff(db, dropoff)
    await db.flush()
    await db.delete(referral)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting referral %s: %s", referral.id, e.orig)
        raise ValueError(f"Unable to delete referral: {str(e.orig)}") from e


# ── Items and derived review status ───────────────────────────────────────────


# Most units of one item a single entry can ask for.
MAX_UNITS_PER_ENTRY = 20


def _quantity(entry: dict[str, Any]) -> int:
    try:
        quantity = max(1, int(entry.get("quantity") or 1))
    except (TypeError, ValueError):
        return 1
    if quantity > MAX_UNITS_PER_ENTRY:
        raise ValueError(
            f"An item can be requested at most {MAX_UNITS_PER_ENTRY} times."
        )
    return quantity


def build_items(requested_items: list[Any]) -> list[ReferralItem]:
    """
    One ReferralItem per requested unit: {"item": "Sofa", "quantity": 2} makes
    two rows. Entries that aren't objects are kept as a single unit.
    """
    items: list[ReferralItem] = []
    for entry in requested_items or []:
        if not isinstance(entry, dict):
            entry = {"item": str(entry)}
        name = str(
            entry.get("item") or entry.get("name") or entry.get("type") or "Item"
        ).strip()
        for _ in range(_quantity(entry)):
            items.append(
                ReferralItem(
                    name=name[:255],
                    size=entry.get("size"),
                    notes=entry.get("notes"),
                    status=ReferralItemStatus.PENDING_REVIEW.value,
                    position=len(items),
                )
            )
    return items


# Units that passed review and are going (or went) to the client.
APPROVED_ITEM_STATUSES = {
    ReferralItemStatus.APPROVED.value,
    ReferralItemStatus.SCHEDULED.value,
    ReferralItemStatus.DELIVERED.value,
}
# Units that won't go out at all.
CLOSED_ITEM_STATUSES = {
    ReferralItemStatus.REJECTED.value,
    ReferralItemStatus.CANCELLED.value,
}


def count_approved(referral: Referral) -> int:
    """Units approved, including those since scheduled or delivered."""
    return sum(1 for item in referral.items if item.status in APPROVED_ITEM_STATUSES)


def compute_review_status(referral: Referral) -> ReferralReviewStatus:
    """
    Derive where the referral is, from review through delivery. Mirrors
    services.donations.compute_review_status. Requires items to be loaded.
    """
    items = referral.items or []
    reviewed = [
        item for item in items if item.status != ReferralItemStatus.PENDING_REVIEW.value
    ]
    if not items or not reviewed:
        return ReferralReviewStatus.PENDING_REVIEW
    if len(reviewed) < len(items):
        return ReferralReviewStatus.PARTIALLY_REVIEWED

    going_out = [item for item in items if item.status not in CLOSED_ITEM_STATUSES]
    if not going_out:
        return ReferralReviewStatus.REJECTED
    if all(item.status == ReferralItemStatus.DELIVERED.value for item in going_out):
        return ReferralReviewStatus.DELIVERED
    if all(
        item.status
        in (ReferralItemStatus.SCHEDULED.value, ReferralItemStatus.DELIVERED.value)
        for item in going_out
    ):
        return ReferralReviewStatus.SCHEDULED
    if len(going_out) == len(items):
        return ReferralReviewStatus.APPROVED
    return ReferralReviewStatus.PARTIALLY_APPROVED


def build_referral(referral: Referral) -> dict[str, Any]:
    """Shape a loaded Referral into the Referral response, with its status."""
    return {
        **{
            column.name: getattr(referral, column.name)
            for column in referral.__table__.columns
        },
        "review_status": compute_review_status(referral),
        "approved_count": count_approved(referral),
        "item_count": len(referral.items or []),
        "items": referral.items or [],
    }


async def review_item(
    db: AsyncSession,
    referral: Referral,
    item_id: str,
    status: ReferralItemStatus,
    rejection_reason: str | None = None,
) -> ReferralItem:
    """Approve or reject one unit of a referral."""
    item = next((item for item in referral.items if item.id == item_id), None)
    if item is None:
        raise LookupError("Referral item not found")
    if referral.status == ReferralStatus.DECLINED.value:
        raise ValueError("Reopen this declined referral before reviewing its items.")
    if item.status in (
        ReferralItemStatus.SCHEDULED.value,
        ReferralItemStatus.DELIVERED.value,
    ):
        raise ValueError("This item already has a drop-off; cancel that first.")

    item.status = status.value
    item.rejection_reason = (
        rejection_reason if status == ReferralItemStatus.REJECTED else None
    )
    item.reviewed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    await db.refresh(item)
    return item


async def _close_items(db: AsyncSession, referral: Referral) -> None:
    """
    A declined referral gets nothing more: units not yet reviewed are rejected,
    units still going out are cancelled along with any drop-off. Delivered
    units stay delivered.
    """
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for item in referral.items:
        if item.status == ReferralItemStatus.DELIVERED.value:
            continue
        dropoff = await dropoffs_service.get_item_dropoff(db, item.id)
        if dropoff is not None:
            await dropoffs_service.release_dropoff(db, dropoff)
        item.status = (
            ReferralItemStatus.REJECTED.value
            if item.status == ReferralItemStatus.PENDING_REVIEW.value
            else ReferralItemStatus.CANCELLED.value
        )
        item.reviewed_at = now


def _reopen_items(referral: Referral) -> None:
    """
    A referral moved out of declined goes back to review: every unit not yet
    delivered is pending again, including any rejected before the decline.
    """
    for item in referral.items:
        if item.status == ReferralItemStatus.DELIVERED.value:
            continue
        item.status = ReferralItemStatus.PENDING_REVIEW.value
        item.rejection_reason = None
        item.reviewed_at = None


def _check_rejection(data: dict[str, Any], status: str) -> None:
    """A rejection reason only belongs on a declined referral."""
    if data.get("rejection_reason") and status != ReferralStatus.DECLINED:
        raise ValueError("A rejection reason can only be set on a declined referral.")


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
        result = await db.execute(
            select(Client.id).where(Client.id == data["client_id"])
        )
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
