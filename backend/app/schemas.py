"""
Pydantic schemas for request/response validation.

These schemas define the contract between frontend and backend.
All API endpoints use these for type safety and automatic OpenAPI documentation.
No password or auth token fields—Supabase handles auth; supabase_user_id links when needed.

@see https://docs.pydantic.dev/latest/
"""

import json
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

# ============ Admin Schemas ============


class AdminBase(BaseModel):
    """Base admin data. Auth via Supabase; supabase_user_id optional."""

    phone_number: Optional[str] = None
    email: Optional[str] = None
    first_name: str
    last_name: str


class AdminCreate(AdminBase):
    """Schema for creating an admin."""

    supabase_user_id: Optional[str] = None


class AdminUpdate(BaseModel):
    """Schema for updating an admin."""

    supabase_user_id: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class Admin(AdminBase):
    """Response schema for admin."""

    id: str
    supabase_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Agency Schemas ============


class AgencyBase(BaseModel):
    """Base agency data."""

    name: str
    email: str
    phone: str
    address: str
    city: str
    province: str
    description: Optional[str] = None
    status: Optional[str] = None  # unprocessed, approved, deactivated
    require_pre_payment: bool = False
    billing_profiles: Optional[str] = None  # JSON string


class AgencyCreate(AgencyBase):
    """Schema for creating an agency."""

    pass


class AgencyUpdate(BaseModel):
    """Schema for updating an agency."""

    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    require_pre_payment: Optional[bool] = None
    billing_profiles: Optional[str] = None


class Agency(AgencyBase):
    """Response schema for agency."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Agent Schemas ============


class AgentBase(BaseModel):
    """Base agent data. Auth via Supabase; supabase_user_id optional."""

    agency_id: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    first_name: str
    last_name: str
    alternate_phone: Optional[str] = None
    extension: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None  # active, inactive


class AgentCreate(AgentBase):
    """Schema for creating an agent."""

    supabase_user_id: Optional[str] = None


class AgentUpdate(BaseModel):
    """Schema for updating an agent."""

    agency_id: Optional[str] = None
    supabase_user_id: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    alternate_phone: Optional[str] = None
    extension: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class Agent(AgentBase):
    """Response schema for agent."""

    id: str
    supabase_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Route Schemas ============


class RouteBase(BaseModel):
    """Base route data."""

    date: datetime
    pickup_furniture_ids: Optional[str] = None  # JSON array of UUIDs
    dropoff_furniture_ids: Optional[str] = None  # JSON array of UUIDs


class RouteCreate(RouteBase):
    """Schema for creating a route."""

    pass


class RouteUpdate(BaseModel):
    """Schema for updating a route."""

    date: Optional[datetime] = None
    pickup_furniture_ids: Optional[str] = None
    dropoff_furniture_ids: Optional[str] = None


class Route(RouteBase):
    """Response schema for route."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Donor Schemas ============


class DonorBase(BaseModel):
    """Base donor data."""

    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    smoking_household: Optional[bool] = None
    donation_type: Optional[str] = None  # person, charity, business, community_drive
    is_anonymous: bool = False


class DonorCreate(DonorBase):
    """Schema for creating a donor."""

    pass


class DonorUpdate(BaseModel):
    """Schema for updating a donor."""

    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    smoking_household: Optional[bool] = None
    donation_type: Optional[str] = None
    is_anonymous: Optional[bool] = None


class Donor(DonorBase):
    """Response schema for donor."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Client Schemas ============


class ClientBase(BaseModel):
    """Base client data."""

    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: str
    apartment_unit: Optional[str] = None
    city: str
    province: str
    postal_code: Optional[str] = None
    agency_id: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[str] = None  # female, male, other, prefer_not_to_say
    phone_notes: Optional[str] = None
    family_type: Optional[str] = None  # single, family
    num_children: int = 0
    num_adults: int = 1
    has_received_furniture_before: Optional[bool] = None
    previous_referral_date: Optional[datetime] = None
    previous_referral_reason: Optional[str] = None
    additional_support_required: bool = False
    agency_referred_id: Optional[str] = None
    pending_delivery: bool = False
    last_delivery_date: Optional[datetime] = None


class ClientCreate(ClientBase):
    """Schema for creating a client."""

    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    apartment_unit: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    agency_id: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[str] = None
    phone_notes: Optional[str] = None
    family_type: Optional[str] = None
    num_children: Optional[int] = None
    num_adults: Optional[int] = None
    has_received_furniture_before: Optional[bool] = None
    previous_referral_date: Optional[datetime] = None
    previous_referral_reason: Optional[str] = None
    additional_support_required: Optional[bool] = None
    agency_referred_id: Optional[str] = None
    pending_delivery: Optional[bool] = None
    last_delivery_date: Optional[datetime] = None


class Client(ClientBase):
    """Response schema for client."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Furniture Schemas ============


class FurnitureBase(BaseModel):
    """Base furniture data."""

    name: str
    status: str  # PICKUP_PENDING, APPROVED, OFFERED, SCHEDULED, DELIVERED, CLOSED
    image_url: Optional[str] = None
    description: Optional[str] = None
    date_donated: Optional[datetime] = None
    date_received: Optional[datetime] = None
    address_pickup: Optional[str] = None
    address_dropoff: Optional[str] = None
    client_id: Optional[str] = None
    change_log: Optional[str] = None  # JSON array of strings
    dispatch_id: Optional[str] = None
    condition: Optional[str] = None  # excellent, good, fair, poor
    colour: Optional[str] = None
    donor_id: str
    category: Optional[str] = None
    quantity: int = 1
    smoking_household: Optional[bool] = None
    donation_type: Optional[str] = None
    charitable_receipt_estimate: Optional[float] = None
    cash_cheque_amount: Optional[float] = None
    cash_cheque_note: Optional[str] = None
    admin_note: Optional[str] = None
    picked_up_or_dropped_off: Optional[str] = None  # picked_up, dropped_off


class FurnitureCreate(FurnitureBase):
    """Schema for creating furniture."""

    pass


class FurnitureUpdate(BaseModel):
    """Schema for updating furniture."""

    name: Optional[str] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    date_donated: Optional[datetime] = None
    date_received: Optional[datetime] = None
    address_pickup: Optional[str] = None
    address_dropoff: Optional[str] = None
    client_id: Optional[str] = None
    change_log: Optional[str] = None
    dispatch_id: Optional[str] = None
    condition: Optional[str] = None
    colour: Optional[str] = None
    donor_id: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    smoking_household: Optional[bool] = None
    donation_type: Optional[str] = None
    charitable_receipt_estimate: Optional[float] = None
    cash_cheque_amount: Optional[float] = None
    cash_cheque_note: Optional[str] = None
    admin_note: Optional[str] = None
    picked_up_or_dropped_off: Optional[str] = None


class Furniture(FurnitureBase):
    """Response schema for furniture."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Referral Schemas ============


class ReferralBase(BaseModel):
    """Base referral data."""

    client_id: str
    agency_id: str
    status: str  # pending, approved, completed, declined
    requested_items: list[Any]  # JSON array of furniture item requests
    dispatch_required: Optional[bool] = None
    referral_date: Optional[datetime] = None
    is_priority: bool = False
    contact_in_case_of_cancellation: bool = False
    coordinated_access_required: bool = False
    date_items_needed: Optional[datetime] = None
    related_to_move: Optional[bool] = None
    staircases: Optional[bool] = None
    narrow_passageways: Optional[bool] = None
    adequate_parking: Optional[bool] = None
    move_other_info: Optional[str] = None
    reason_low_income: bool = False
    reason_exiting_homelessness: bool = False
    reason_new_to_community: bool = False
    reason_escaping_abuse: bool = False
    reason_mental_health: bool = False
    reason_exiting_prison: bool = False
    reason_physical_disability: bool = False
    reason_health_issues: bool = False
    reason_other: bool = False
    reason_other_info: Optional[str] = None
    secondary_agent_name: Optional[str] = None
    secondary_agent_email: Optional[str] = None
    secondary_agent_phone: Optional[str] = None


class ReferralCreate(ReferralBase):
    """Schema for creating a referral."""

    pass


class ReferralUpdate(BaseModel):
    """Schema for updating a referral."""

    client_id: Optional[str] = None
    agency_id: Optional[str] = None
    status: Optional[str] = None
    requested_items: Optional[list[Any]] = None
    dispatch_required: Optional[bool] = None
    referral_date: Optional[datetime] = None
    is_priority: Optional[bool] = None
    contact_in_case_of_cancellation: Optional[bool] = None
    coordinated_access_required: Optional[bool] = None
    date_items_needed: Optional[datetime] = None
    related_to_move: Optional[bool] = None
    staircases: Optional[bool] = None
    narrow_passageways: Optional[bool] = None
    adequate_parking: Optional[bool] = None
    move_other_info: Optional[str] = None
    reason_low_income: Optional[bool] = None
    reason_exiting_homelessness: Optional[bool] = None
    reason_new_to_community: Optional[bool] = None
    reason_escaping_abuse: Optional[bool] = None
    reason_mental_health: Optional[bool] = None
    reason_exiting_prison: Optional[bool] = None
    reason_physical_disability: Optional[bool] = None
    reason_health_issues: Optional[bool] = None
    reason_other: Optional[bool] = None
    reason_other_info: Optional[str] = None
    secondary_agent_name: Optional[str] = None
    secondary_agent_email: Optional[str] = None
    secondary_agent_phone: Optional[str] = None


class Referral(ReferralBase):
    """Response schema for referral."""

    id: str
    created_at: datetime
    updated_at: datetime

    @field_validator("requested_items", mode="before")
    @classmethod
    def parse_requested_items(cls, v: Any) -> list:
        """Parse requested_items from JSON string when loading from ORM."""
        if isinstance(v, str):
            return json.loads(v) if v else []
        return v if v is not None else []

    model_config = ConfigDict(from_attributes=True)
