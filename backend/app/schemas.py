"""
Pydantic schemas for request/response validation.

These schemas define the API contract between frontend and backend.
All schemas use enums from app.enums for categorical fields.
No password or auth token fields — Supabase handles auth.

Schema naming convention:
    XBase       — shared fields (used by Create and as base for response)
    XCreate     — fields accepted on POST (extends XBase)
    XUpdate     — all-Optional fields accepted on PUT
    X           — full response schema (extends XBase, adds id + timestamps)

@see https://docs.pydantic.dev/latest/
"""

import json
from datetime import date, datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .enums import (
    DonationReviewStatus,
    DonationStatus,
    DonationTypeEnum,
    FamilyTypeEnum,
    FurnitureConditionEnum,
    FurnitureRejectionReason,
    FurnitureStatus,
    GenderEnum,
    ImmigrationStatusEnum,
    ReferralItemStatus,
    ReferralRejectionReason,
    ReferralReviewStatus,
    ReferralStatus,
    RouteStatus,
)


def _to_naive_utc(v: Optional[datetime]) -> Optional[datetime]:
    """
    Normalise an inbound datetime to naive UTC.

    The DateTime columns are TIMESTAMP WITHOUT TIME ZONE and asyncpg refuses a
    tz-aware value outright, but clients legitimately send offsets — JavaScript's
    Date.toISOString() emits 'Z' — so convert once here rather than at every call
    site. Matches how the models write timestamps.
    """
    if v is not None and v.tzinfo is not None:
        return v.astimezone(timezone.utc).replace(tzinfo=None)
    return v


# ============ Admin Schemas ============


class AdminBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone_number: str


class AdminCreate(AdminBase):
    supabase_user_id: Optional[str] = None


class AdminUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    supabase_user_id: Optional[str] = None


class Admin(AdminBase):
    id: str
    supabase_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Agency Schemas ============


class AgencyBase(BaseModel):
    name: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    postal_code: str
    phone_number: str
    program: Optional[str] = None


class AgencyCreate(AgencyBase):
    pass


class AgencyUpdate(BaseModel):
    name: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone_number: Optional[str] = None
    program: Optional[str] = None


class Agency(AgencyBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Agent Schemas ============


class AgentBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone_number: str
    agency_id: str
    is_admin: bool = False


class AgentCreate(AgentBase):
    supabase_user_id: Optional[str] = None


class AgentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    agency_id: Optional[str] = None
    is_admin: Optional[bool] = None
    supabase_user_id: Optional[str] = None


class Agent(AgentBase):
    id: str
    supabase_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Donor Schemas ============


class DonorBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str


class DonorCreate(DonorBase):
    pass


class DonorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class Donor(DonorBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DonorListItem(Donor):
    """
    A donor as returned by `GET /donors`, with donation stats.

    Separate from `Donor` because the other donor responses serialize straight
    from the ORM row, which doesn't have these fields.
    """

    donation_count: int
    # When their most recent donation was created; None if they have none.
    last_donated_at: Optional[datetime]


# ============ Donation Schemas ============


class DonationBase(BaseModel):
    donor_id: str
    donation_type: Optional[DonationTypeEnum] = None
    charitable_receipt_estimate: Optional[float] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[DonationStatus] = None
    smoking_household: Optional[bool] = None
    has_pets: Optional[bool] = None


class DonationCreate(DonationBase):
    pass


class DonationSubmissionItem(BaseModel):
    """One item on the anonymous donate form."""

    # The donate form's type ("Sofa", "Mattress", "Other", ...). Mapped to an
    # inventory type where one matches; see services.inventory.
    furniture_type: str = Field(..., min_length=1, max_length=255)
    # Only for types that come in sizes (mattress, box spring).
    size: Optional[str] = None
    has_stains: bool
    # Dining sets: how many chairs come with the table.
    chair_count: Optional[int] = Field(None, ge=0)
    # Free text for "Other".
    other_description: Optional[str] = None


class DonationSubmission(BaseModel):
    """
    The whole donate form in one request: the donation and its items, created
    together so a failed item never leaves a donation without its furniture.
    """

    donor_id: str
    address_line_1: str = Field(..., min_length=1)
    address_line_2: Optional[str] = None
    city: str = Field(..., min_length=1)
    postal_code: Optional[str] = None
    smoking_household: bool
    has_pets: bool
    items: list[DonationSubmissionItem] = Field(..., min_length=1)


class DonationUpdate(BaseModel):
    donor_id: Optional[str] = None
    donation_type: Optional[DonationTypeEnum] = None
    charitable_receipt_estimate: Optional[float] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[DonationStatus] = None
    smoking_household: Optional[bool] = None
    has_pets: Optional[bool] = None


class Donation(DonationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Client Schemas ============


class ClientBase(BaseModel):
    first_name: str
    last_name: str
    birthday: date
    gender: Optional[GenderEnum] = None
    phone: Optional[str] = None
    phone_notes: Optional[str] = None
    speaks_english: bool = True
    language: Optional[str] = None  # Primary language when speaks_english=False
    family_type: FamilyTypeEnum
    num_children: int
    num_adults: int
    coordinated_access_required: bool = False
    agency_id: Optional[str] = None
    immigration_status: Optional[ImmigrationStatusEnum] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[GenderEnum] = None
    phone: Optional[str] = None
    phone_notes: Optional[str] = None
    speaks_english: Optional[bool] = None
    language: Optional[str] = None
    family_type: Optional[FamilyTypeEnum] = None
    num_children: Optional[int] = None
    num_adults: Optional[int] = None
    coordinated_access_required: Optional[bool] = None
    agency_id: Optional[str] = None
    immigration_status: Optional[ImmigrationStatusEnum] = None


class Client(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Furniture Schemas ============


class FurniturePhotoBase(BaseModel):
    """
    What a client sends for a photo.

    No position: display order is the order of the submitted list, so accepting
    one would advertise a field the server ignores.
    """

    url: str


class FurniturePhoto(FurniturePhotoBase):
    id: str
    furniture_id: str
    position: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FurnitureBase(BaseModel):
    name: str
    image_url: str
    description: str
    condition: Optional[FurnitureConditionEnum] = None
    colour: str
    category: str
    smoking_household: bool
    has_pets: bool
    status: FurnitureStatus
    rejection_reason: Optional[FurnitureRejectionReason] = None
    rejection_details: Optional[str] = None
    donation_id: Optional[str] = None
    referral_id: Optional[str] = None
    pickup_id: Optional[str] = None
    inventory_id: Optional[str] = None


class FurnitureCreate(FurnitureBase):
    pass


class FurnitureUpdate(BaseModel):
    name: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    condition: Optional[FurnitureConditionEnum] = None
    colour: Optional[str] = None
    category: Optional[str] = None
    smoking_household: Optional[bool] = None
    has_pets: Optional[bool] = None
    status: Optional[FurnitureStatus] = None
    rejection_reason: Optional[FurnitureRejectionReason] = None
    rejection_details: Optional[str] = None
    donation_id: Optional[str] = None
    referral_id: Optional[str] = None
    pickup_id: Optional[str] = None
    inventory_id: Optional[str] = None


class FurnitureReject(BaseModel):
    """Payload for POST /furniture/{id}/reject."""

    rejection_reason: FurnitureRejectionReason
    rejection_details: Optional[str] = None


class Furniture(FurnitureBase):
    id: str
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FurnitureDetail(Furniture):
    """Furniture with its ordered photo set, for the donation review UI."""

    photos: list[FurniturePhoto] = []


# ============ Inventory Schemas ============


class Inventory(BaseModel):
    """One item type the donate and referral forms offer, with its count."""

    id: str
    name: str
    size: Optional[str] = None
    category: str
    quantity: int
    position: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Route Schemas ============


class RouteBase(BaseModel):
    date: datetime
    status: Optional[RouteStatus] = None

    _normalize_date = field_validator("date")(_to_naive_utc)


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    date: Optional[datetime] = None
    status: Optional[RouteStatus] = None

    _normalize_date = field_validator("date")(_to_naive_utc)


class Route(RouteBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Pickup Schemas ============


class PickupBase(BaseModel):
    # Optional: a pickup is scheduled against a donation during review, and only
    # later assigned to a route by dispatch.
    route_id: Optional[str] = None
    donation_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    note: Optional[str] = None

    _normalize_scheduled_date = field_validator("scheduled_date")(_to_naive_utc)


class PickupCreate(PickupBase):
    pass


class PickupUpdate(BaseModel):
    route_id: Optional[str] = None
    donation_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    note: Optional[str] = None

    _normalize_scheduled_date = field_validator("scheduled_date")(_to_naive_utc)


class Pickup(PickupBase):
    id: str
    confirmed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Dropoff Schemas ============


class DropoffBase(BaseModel):
    route_id: str
    # The requested unit being delivered. Set this; furniture_id is optional
    # and predates referral items.
    referral_item_id: Optional[str] = None
    furniture_id: Optional[str] = None
    referral_id: Optional[str] = None
    high_priority: bool = False
    contact_in_case_of_cancellation: bool = False
    dispatch_required: bool = False


class DropoffCreate(DropoffBase):
    @model_validator(mode="after")
    def needs_something_to_deliver(self):
        if not self.referral_item_id and not self.furniture_id:
            raise ValueError("Provide referral_item_id (or furniture_id).")
        return self


class DropoffUpdate(BaseModel):
    furniture_id: Optional[str] = None
    referral_id: Optional[str] = None
    high_priority: Optional[bool] = None
    contact_in_case_of_cancellation: Optional[bool] = None
    dispatch_required: Optional[bool] = None


class Dropoff(DropoffBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Referral Schemas ============


# Matches the reject dialog's text limit.
REFERRAL_REJECTION_DETAILS_MAX_LENGTH = 500


class ReferralBase(BaseModel):
    # Client
    client_id: str
    requested_items: list[Any]  # Stored as JSON; parsed on read
    # Agent information
    agent_id: Optional[str] = None
    secondary_agent_id: Optional[str] = None
    agents_present_during_delivery: Optional[bool] = None
    program: Optional[str] = None
    # Referral details
    is_priority: bool = False
    priority_description: Optional[str] = None
    # Reasons
    reason_low_income: bool = False
    reason_exiting_homelessness: bool = False
    reason_new_to_community: bool = False
    previous_city_town_country: Optional[str] = None
    reason_escaping_abuse: bool = False
    reason_mental_health: bool = False
    reason_exiting_prison: bool = False
    reason_physical_disability: bool = False
    reason_health_issues: bool = False
    reason_other: bool = False
    reason_other_info: Optional[str] = None
    # Delivery details
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    postal_code: Optional[str] = None
    date_items_needed: Optional[datetime] = None
    staircases: Optional[bool] = None
    narrow_passageways: Optional[bool] = None
    adequate_parking: Optional[bool] = None
    move_other_info: Optional[str] = None
    notes_and_instructions: Optional[str] = None
    status: ReferralStatus
    # Only when status is declined; details are required for OTHER.
    rejection_reason: Optional[ReferralRejectionReason] = None
    rejection_details: Optional[str] = Field(
        default=None, max_length=REFERRAL_REJECTION_DETAILS_MAX_LENGTH
    )


def _check_rejection_details(model):
    if (
        model.rejection_reason == ReferralRejectionReason.OTHER
        and not (model.rejection_details or "").strip()
    ):
        raise ValueError("rejection_details is required when the reason is other.")
    return model


class ReferralCreate(ReferralBase):
    _rejection_details = model_validator(mode="after")(_check_rejection_details)


class ReferralUpdate(BaseModel):
    client_id: Optional[str] = None
    requested_items: Optional[list[Any]] = None
    agent_id: Optional[str] = None
    secondary_agent_id: Optional[str] = None
    agents_present_during_delivery: Optional[bool] = None
    program: Optional[str] = None
    is_priority: Optional[bool] = None
    priority_description: Optional[str] = None
    reason_low_income: Optional[bool] = None
    reason_exiting_homelessness: Optional[bool] = None
    reason_new_to_community: Optional[bool] = None
    previous_city_town_country: Optional[str] = None
    reason_escaping_abuse: Optional[bool] = None
    reason_mental_health: Optional[bool] = None
    reason_exiting_prison: Optional[bool] = None
    reason_physical_disability: Optional[bool] = None
    reason_health_issues: Optional[bool] = None
    reason_other: Optional[bool] = None
    reason_other_info: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    date_items_needed: Optional[datetime] = None
    staircases: Optional[bool] = None
    narrow_passageways: Optional[bool] = None
    adequate_parking: Optional[bool] = None
    move_other_info: Optional[str] = None
    notes_and_instructions: Optional[str] = None
    status: Optional[ReferralStatus] = None
    rejection_reason: Optional[ReferralRejectionReason] = None
    rejection_details: Optional[str] = Field(
        default=None, max_length=REFERRAL_REJECTION_DETAILS_MAX_LENGTH
    )

    _rejection_details = model_validator(mode="after")(_check_rejection_details)


class ReferralItem(BaseModel):
    """One requested unit on a referral, with its own review status."""

    id: str
    referral_id: str
    name: str
    size: Optional[str] = None
    notes: Optional[str] = None
    status: ReferralItemStatus
    rejection_reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    inventory_id: Optional[str] = None
    position: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReferralItemReject(BaseModel):
    """Payload for POST /referrals/{id}/items/{item_id}/reject."""

    rejection_reason: Optional[str] = None


class Referral(ReferralBase):
    id: str
    created_at: datetime
    updated_at: datetime
    # Derived from the items, never stored — see
    # services.referrals.compute_review_status.
    review_status: ReferralReviewStatus = ReferralReviewStatus.PENDING_REVIEW
    # For the "Approved 2/4" label.
    approved_count: int = 0
    item_count: int = 0
    items: list[ReferralItem] = []

    @field_validator("requested_items", mode="before")
    @classmethod
    def parse_requested_items(cls, v: Any) -> list:
        """Parse requested_items from JSON string when loading from ORM."""
        if isinstance(v, str):
            return json.loads(v) if v else []
        return v if v is not None else []

    model_config = ConfigDict(from_attributes=True)


# ============ Composite Schemas ============
# Schemas that stitch several resources together for a single screen. Kept at the
# end of the file so they can reference every model above.


class DonationDetail(Donation):
    """
    Everything the donation-request review screen needs, in one response.

    review_status is computed from the furniture statuses and pickup rather than
    stored — see services.donations.compute_review_status.
    """

    review_status: DonationReviewStatus
    # For the "Approved 2/4" label. Approved includes items that have moved
    # downstream of approval (OFFERED, SCHEDULED, ...).
    approved_count: int = 0
    item_count: int = 0
    donor: Optional[Donor] = None
    furniture_items: list[FurnitureDetail] = []
    pickup: Optional[Pickup] = None

    model_config = ConfigDict(from_attributes=True)
