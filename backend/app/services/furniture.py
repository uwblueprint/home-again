"""Furniture service layer."""

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import selectinload

from ..enums import FurnitureRejectionReason, FurnitureStatus
from ..models import Donation, Furniture, FurniturePhoto, Referral
from ..schemas import (
    FurnitureCreate,
    FurniturePhotoBase,
    FurnitureReject,
    FurnitureUpdate,
)

logger = logging.getLogger(__name__)


async def list_furniture(db: AsyncSession) -> list[Furniture]:
    result = await db.execute(select(Furniture).order_by(Furniture.name))
    return result.scalars().all()


async def get_furniture(db: AsyncSession, furniture_id: str) -> Furniture | None:
    result = await db.execute(select(Furniture).where(Furniture.id == furniture_id))
    return result.scalar_one_or_none()


async def create_furniture(db: AsyncSession, payload: FurnitureCreate) -> Furniture:
    data = payload.model_dump()
    await _validate_fks(db, data)
    _validate_rejection_fields(
        status=data.get("status"),
        rejection_reason=data.get("rejection_reason"),
        rejection_details=data.get("rejection_details"),
    )
    db_furniture = Furniture(**data)
    db.add(db_furniture)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating furniture: %s", e.orig)
        raise ValueError(f"Unable to create furniture: {str(e.orig)}") from e
    await db.refresh(db_furniture)
    return db_furniture


async def update_furniture(
    db: AsyncSession, furniture: Furniture, payload: FurnitureUpdate
) -> Furniture:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")
    await _validate_fks(db, data)
    # Validate against the merged result, not just the patch, so a partial update
    # can't leave the row in an inconsistent review state.
    _validate_rejection_fields(
        status=data.get("status", furniture.status),
        rejection_reason=data.get("rejection_reason", furniture.rejection_reason),
        rejection_details=data.get("rejection_details", furniture.rejection_details),
    )
    for key, value in data.items():
        setattr(furniture, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception(
            "IntegrityError updating furniture %s: %s", furniture.id, e.orig
        )
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(furniture)
    return furniture


async def approve_furniture(db: AsyncSession, furniture: Furniture) -> Furniture:
    """Mark an item approved, clearing any rejection recorded by an earlier review."""
    furniture.status = FurnitureStatus.APPROVED.value
    furniture.rejection_reason = None
    furniture.rejection_details = None
    furniture.reviewed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    return await _commit_review(db, furniture)


async def reject_furniture(
    db: AsyncSession, furniture: Furniture, payload: FurnitureReject
) -> Furniture:
    """Mark an item rejected with a reason. Reason OTHER requires free-text details."""
    _validate_rejection_fields(
        status=FurnitureStatus.REJECTED.value,
        rejection_reason=payload.rejection_reason,
        rejection_details=payload.rejection_details,
    )
    furniture.status = FurnitureStatus.REJECTED.value
    furniture.rejection_reason = payload.rejection_reason.value
    furniture.rejection_details = payload.rejection_details
    furniture.reviewed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    return await _commit_review(db, furniture)


async def _commit_review(db: AsyncSession, furniture: Furniture) -> Furniture:
    """Shared persistence tail for approve_furniture / reject_furniture."""
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception(
            "IntegrityError reviewing furniture %s: %s", furniture.id, e.orig
        )
        raise ValueError(f"Review failed: {str(e.orig)}") from e
    await db.refresh(furniture)
    return furniture


async def get_furniture_with_photos(
    db: AsyncSession, furniture_id: str
) -> Furniture | None:
    result = await db.execute(
        select(Furniture)
        .where(Furniture.id == furniture_id)
        .options(selectinload(Furniture.photos))
    )
    return result.scalar_one_or_none()


async def replace_furniture_photos(
    db: AsyncSession, furniture: Furniture, photos: list[FurniturePhotoBase]
) -> list[FurniturePhoto]:
    """
    Replace an item's whole photo set in one call.

    Photos are ordered and shown as a group, so the UI submits the full set
    rather than patching individual rows. Position is taken from list order,
    ignoring any client-supplied value, so it always stays gap-free.
    """
    existing = await db.execute(
        select(FurniturePhoto).where(FurniturePhoto.furniture_id == furniture.id)
    )
    for photo in existing.scalars():
        await db.delete(photo)

    created = [
        FurniturePhoto(furniture_id=furniture.id, url=photo.url, position=index)
        for index, photo in enumerate(photos)
    ]
    db.add_all(created)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception(
            "IntegrityError replacing photos for furniture %s: %s", furniture.id, e.orig
        )
        raise ValueError(f"Unable to save photos: {str(e.orig)}") from e

    for photo in created:
        await db.refresh(photo)
    return created


def _validate_rejection_fields(
    status: str | None,
    rejection_reason: str | None,
    rejection_details: str | None,
) -> None:
    """
    Enforce the rejection invariants:
      - REJECTED requires a reason
      - reason OTHER requires details
      - any other status carries no rejection fields
    """
    status = _enum_value(status)
    rejection_reason = _enum_value(rejection_reason)

    if status == FurnitureStatus.REJECTED.value:
        if not rejection_reason:
            raise ValueError("A rejection_reason is required to reject an item.")
        if (
            rejection_reason == FurnitureRejectionReason.OTHER.value
            and not (rejection_details or "").strip()
        ):
            raise ValueError(
                "rejection_details is required when rejection_reason is 'other'."
            )
        return

    if rejection_reason or rejection_details:
        raise ValueError(
            "rejection_reason and rejection_details are only valid on a rejected item."
        )


def _enum_value(value: object) -> str | None:
    """Accept either an enum member or its raw string value."""
    return getattr(value, "value", value)


async def delete_furniture(db: AsyncSession, furniture: Furniture) -> None:
    await db.delete(furniture)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception(
            "IntegrityError deleting furniture %s: %s", furniture.id, e.orig
        )
        raise ValueError(f"Unable to delete furniture: {str(e.orig)}") from e


async def _validate_fks(db: AsyncSession, data: dict) -> None:
    """Raise ValueError if any provided FK references a non-existent record."""
    if "donation_id" in data and data["donation_id"]:
        result = await db.execute(
            select(Donation.id).where(Donation.id == data["donation_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Donation with ID '{data['donation_id']}' does not exist."
            )

    if "referral_id" in data and data["referral_id"]:
        result = await db.execute(
            select(Referral.id).where(Referral.id == data["referral_id"])
        )
        if not result.scalar_one_or_none():
            raise ValueError(
                f"Referral with ID '{data['referral_id']}' does not exist."
            )
