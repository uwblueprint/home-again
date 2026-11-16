"""Donation service layer."""

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..enums import DonationReviewStatus, DonationStatus, FurnitureStatus
from ..models import Donation, Donor, Furniture, Inventory, Pickup
from . import inventory as inventory_service
from ..schemas import DonationCreate, DonationSubmission, DonationUpdate

logger = logging.getLogger(__name__)

# Item statuses that mean an admin has finished reviewing that item.
# Every status except PICKUP_PENDING: once an approved item moves downstream
# (OFFERED, SCHEDULED, ...) the donation must not slide back to "pending review".
REVIEWED_FURNITURE_STATUSES = {
    status.value
    for status in FurnitureStatus
    if status is not FurnitureStatus.PICKUP_PENDING
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

    # Picked up is final: its items are already counted in stock, so moving it
    # back (and completing it again) would count them twice.
    if (
        donation.status == DonationStatus.COMPLETED.value
        and "status" in data
        and data["status"] != DonationStatus.COMPLETED
    ):
        raise ValueError("This donation was picked up, so its status can't change.")

    picked_up_now = (
        data.get("status") == DonationStatus.COMPLETED
        and donation.status != DonationStatus.COMPLETED.value
    )
    for key, value in data.items():
        setattr(donation, key, value)
    if picked_up_now:
        await _add_collected_items_to_inventory(db, donation.id)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError updating donation %s: %s", donation.id, e.orig)
        raise ValueError(f"Update failed: {str(e.orig)}") from e
    await db.refresh(donation)
    return donation


async def _add_collected_items_to_inventory(db: AsyncSession, donation_id: str) -> None:
    """
    A picked-up donation's approved items are now stock: +1 for each item's
    type. Rejected and unreviewed items weren't collected; items with no type
    can't be counted.
    """
    result = await db.execute(
        select(Furniture.inventory_id).where(
            Furniture.donation_id == donation_id,
            Furniture.inventory_id.is_not(None),
            Furniture.status.in_(REVIEWED_FURNITURE_STATUSES),
            Furniture.status != FurnitureStatus.REJECTED.value,
        )
    )
    for inventory_id in result.scalars().all():
        await inventory_service.add(db, inventory_id)


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


async def list_donation_details(db: AsyncSession) -> list[Donation]:
    """Every donation, newest first, loaded like get_donation_detail."""
    result = await db.execute(
        select(Donation)
        .order_by(Donation.created_at.desc())
        .options(
            selectinload(Donation.donor),
            selectinload(Donation.furniture_items).selectinload(Furniture.photos),
            selectinload(Donation.pickups),
        )
    )
    return result.scalars().all()


# The donate form's "Dining table & chairs /sets" is one entry with a chair
# count, but the table and each chair are separate pieces in stock.
DINING_SET_TYPE = "dining table & chairs /sets"
DINING_TABLE_ID = "dining-kitchen-table"
DINING_CHAIR_ID = "kitchen-dining-chair"


def _describe_item(item) -> str:
    """The line the review screen shows under the item name."""
    parts = ["Has stains" if item.has_stains else "No stains"]
    if item.other_description and item.other_description.strip():
        parts.append(item.other_description.strip())
    return ". ".join(parts)


async def _pieces(db: AsyncSession, item) -> list[tuple[str, Inventory | None]]:
    """
    The donated pieces one form entry stands for, each with its inventory type:
    a dining set is its table plus one row per chair, so each can be reviewed
    and counted on its own. Everything else is a single piece.
    """
    if item.furniture_type.strip().lower() == DINING_SET_TYPE:
        table = await inventory_service.get_inventory_item(db, DINING_TABLE_ID)
        chair = await inventory_service.get_inventory_item(db, DINING_CHAIR_ID)
        chairs = [("Dining chair", chair)] * (item.chair_count or 0)
        return [("Dining table", table), *chairs]

    inventory = await inventory_service.resolve_inventory_item(
        db, item.furniture_type, item.size
    )
    name = item.furniture_type.strip()
    if item.size:
        name = f"{name} ({item.size.strip()})"
    return [(name, inventory)]


async def submit_donation(db: AsyncSession, payload: DonationSubmission) -> Donation:
    """
    Create a donation and its items from the donate form, in one transaction.
    Each piece is linked to its inventory type where one matches; a dining set
    becomes its table plus one row per chair.
    """
    donor_result = await db.execute(
        select(Donor.id).where(Donor.id == payload.donor_id)
    )
    if not donor_result.scalar_one_or_none():
        raise ValueError(f"Donor with ID '{payload.donor_id}' does not exist.")

    donation = Donation(
        **payload.model_dump(exclude={"items"}),
        status=DonationStatus.PENDING.value,
    )
    db.add(donation)
    await db.flush()

    position = 0
    for item in payload.items:
        for name, inventory in await _pieces(db, item):
            db.add(
                Furniture(
                    name=name,
                    position=position,
                    # Photos upload separately (PUT /furniture/{id}/photos);
                    # the form has no image or colour fields yet.
                    image_url="",
                    description=_describe_item(item),
                    colour="",
                    category=inventory.category if inventory else "Other",
                    smoking_household=payload.smoking_household,
                    has_pets=payload.has_pets,
                    status=FurnitureStatus.PICKUP_PENDING.value,
                    donation_id=donation.id,
                    inventory_id=inventory.id if inventory else None,
                )
            )
            position += 1

    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        logger.exception("IntegrityError submitting donation: %s", e.orig)
        raise ValueError(f"Unable to submit donation: {str(e.orig)}") from e
    return await get_donation_detail(db, donation.id)


def get_active_pickup(donation: Donation) -> Pickup | None:
    """
    The pickup the review screen means by "the" pickup.

    A donation can carry two kinds of pickup row: the one an admin scheduled
    during review (has a scheduled_date, no route yet) and the one dispatch
    later created to assign a route (has a route, no date). Prefer a scheduled
    one, so a subsequent dispatch row doesn't hide the donor's confirmed date.
    """
    pickups = donation.pickups or []
    if not pickups:
        return None
    scheduled = [pickup for pickup in pickups if pickup.scheduled_date]
    return max(scheduled or pickups, key=lambda pickup: pickup.created_at)


def count_approved(donation: Donation) -> int:
    """
    Items that passed review. Downstream statuses (OFFERED, SCHEDULED, ...) only
    follow an approval, so they count too; only REJECTED and unreviewed items
    don't.
    """
    return sum(
        1
        for item in donation.furniture_items or []
        if item.status in REVIEWED_FURNITURE_STATUSES
        and item.status != FurnitureStatus.REJECTED.value
    )


def compute_review_status(donation: Donation) -> DonationReviewStatus:
    """
    Derive where the donation request is, from review through to pickup.

    Never stored: recomputing keeps the badge honest when an item is re-reviewed
    or a scheduled pickup is removed. Requires furniture_items and pickups to be
    loaded — use get_donation_detail.
    """
    # Picked up is final, whatever the items say.
    if donation.status == DonationStatus.COMPLETED.value:
        return DonationReviewStatus.PICKED_UP

    items = donation.furniture_items or []
    reviewed = [item for item in items if item.status in REVIEWED_FURNITURE_STATUSES]

    # A donation with no items yet has nothing to review.
    if not items or not reviewed:
        return DonationReviewStatus.PENDING_REVIEW
    if len(reviewed) < len(items):
        return DonationReviewStatus.PARTIALLY_REVIEWED

    approved = count_approved(donation)
    if approved == 0:
        return DonationReviewStatus.REJECTED

    # Scheduling only outranks a *finished* review; a pickup booked while items
    # are still outstanding must not hide that they need attention.
    pickup = get_active_pickup(donation)
    if pickup and pickup.scheduled_date:
        if pickup.confirmed_at:
            return DonationReviewStatus.CONFIRMED
        return DonationReviewStatus.SCHEDULED

    if approved == len(items):
        return DonationReviewStatus.APPROVED
    return DonationReviewStatus.PARTIALLY_APPROVED


def build_donation_detail(donation: Donation) -> dict:
    """Shape a loaded Donation into the DonationDetail response payload."""
    return {
        **{
            column.name: getattr(donation, column.name)
            for column in donation.__table__.columns
        },
        "review_status": compute_review_status(donation),
        "approved_count": count_approved(donation),
        "item_count": len(donation.furniture_items or []),
        "donor": donation.donor,
        "furniture_items": donation.furniture_items,
        "pickup": get_active_pickup(donation),
    }
