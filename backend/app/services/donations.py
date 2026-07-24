"""Donation service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..enums import DonationReviewStatus, FurnitureStatus
from ..models import Donation, Donor, Furniture, Pickup
from ..schemas import DonationCreate, DonationUpdate

logger = logging.getLogger(__name__)

# Item statuses that mean an admin has finished reviewing that item.
REVIEWED_FURNITURE_STATUSES = {
    FurnitureStatus.APPROVED.value,
    FurnitureStatus.REJECTED.value,
}


async def list_donations(db: AsyncSession) -> list[Donation]:
    result = await db.execute(select(Donation).order_by(Donation.created_at.desc()))
    return result.scalars().all()


async def get_donation(db: AsyncSession, donation_id: str) -> Donation | None:
    result = await db.execute(select(Donation).where(Donation.id == donation_id))
    return result.scalar_one_or_none()


async def create_donation(db: AsyncSession, payload: DonationCreate) -> Donation:
    # Validate donor exists before attempting insert
    donor_result = await db.execute(
        select(Donor.id).where(Donor.id == payload.donor_id)
    )
    if not donor_result.scalar_one_or_none():
        raise ValueError(f"Donor with ID '{payload.donor_id}' does not exist.")

    db_donation = Donation(**payload.model_dump())
    db.add(db_donation)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError creating donation: %s", e.orig)
        raise ValueError(f"Unable to create donation: {str(e.orig)}") from e
    await db.refresh(db_donation)
    return db_donation


async def update_donation(
    db: AsyncSession, donation: Donation, payload: DonationUpdate
) -> Donation:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise ValueError("No update fields were provided.")

    # Validate new donor_id if provided
    if "donor_id" in data:
        if not data["donor_id"]:
            raise ValueError("donor_id cannot be null.")
        donor_result = await db.execute(
            select(Donor.id).where(Donor.id == data["donor_id"])
        )
        if not donor_result.scalar_one_or_none():
            raise ValueError(f"Donor with ID '{data['donor_id']}' does not exist.")

    for key, value in data.items():
        setattr(donation, key, value)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating donation %s: %s", donation.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(donation)
    return donation


async def delete_donation(db: AsyncSession, donation: Donation) -> None:
    await db.delete(donation)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError deleting donation %s: %s", donation.id, e.orig)
        raise ValueError(f"Unable to delete donation: {str(e.orig)}") from e


async def get_donation_detail(db: AsyncSession, donation_id: str) -> Donation | None:
    """
    Load a donation with everything the review screen renders, in one round trip:
    donor, furniture items with their ordered photos, and the pickup.
    """
    result = await db.execute(
        select(Donation)
        .where(Donation.id == donation_id)
        .options(
            selectinload(Donation.donor),
            selectinload(Donation.furniture_items).selectinload(Furniture.photos),
            selectinload(Donation.pickups),
        )
    )
    return result.scalar_one_or_none()


def get_active_pickup(donation: Donation) -> Pickup | None:
    """The pickup a donation is currently scheduled under — its most recent one."""
    if not donation.pickups:
        return None
    return max(donation.pickups, key=lambda pickup: pickup.created_at)


def compute_review_status(donation: Donation) -> DonationReviewStatus:
    """
    Derive how far along the admin's review is.

    Never stored: recomputing keeps the badge honest when an item is re-reviewed
    or a scheduled pickup is removed. Requires furniture_items and pickups to be
    loaded — use get_donation_detail.
    """
    pickup = get_active_pickup(donation)
    if pickup and pickup.scheduled_date:
        return DonationReviewStatus.SCHEDULED

    items = donation.furniture_items or []
    reviewed = [item for item in items if item.status in REVIEWED_FURNITURE_STATUSES]

    # A donation with no items yet has nothing to review.
    if not items or not reviewed:
        return DonationReviewStatus.PENDING_REVIEW
    if len(reviewed) < len(items):
        return DonationReviewStatus.PARTIALLY_REVIEWED
    return DonationReviewStatus.REVIEWED


def build_donation_detail(donation: Donation) -> dict:
    """Shape a loaded Donation into the DonationDetail response payload."""
    return {
        **{
            column.name: getattr(donation, column.name)
            for column in donation.__table__.columns
        },
        "review_status": compute_review_status(donation),
        "donor": donation.donor,
        "furniture_items": donation.furniture_items,
        "pickup": get_active_pickup(donation),
    }
