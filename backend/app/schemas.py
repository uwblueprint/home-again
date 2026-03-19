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

from pydantic import BaseModel, ConfigDict, field_validator

# ============ Admin Schemas ============


class AdminBase(BaseModel):
    """Admin business fields. Auth via Supabase; supabase_user_id optional."""

    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None


class AdminCreate(AdminBase):
    """Schema for creating an admin."""

    supabase_user_id: Optional[str] = None


class AdminUpdate(BaseModel):
    """Schema for updating an admin."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    supabase_user_id: Optional[str] = None


class Admin(AdminBase):
    """Response schema for admin."""

    id: str
    supabase_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Agency Schemas ============


class AgencyBase(BaseModel):
    """Agency business fields."""

    name: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    postal_code: Optional[str] = None
    phone: str
    main_agent_id: Optional[str] = None


class AgencyCreate(AgencyBase):
    """Schema for creating an agency."""

    pass


class AgencyUpdate(BaseModel):
    """Schema for updating an agency."""

    name: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    main_agent_id: Optional[str] = None


class Agency(AgencyBase):
    """Response schema for agency."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Agent Schemas ============


class AgentBase(BaseModel):
    """Agent business fields."""

    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    agency_id: str


class AgentCreate(AgentBase):
    """Schema for creating an agent."""

    supabase_user_id: Optional[str] = None


class AgentUpdate(BaseModel):
    """Schema for updating an agent."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    agency_id: Optional[str] = None
    supabase_user_id: Optional[str] = None


class Agent(AgentBase):
    """Response schema for agent."""

    id: str
    supabase_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Route Schemas ============


class RouteBase(BaseModel):
    """Route business fields."""

    date: datetime
    status: Optional[str] = None
    pickup_furniture_ids: Optional[str] = None  # JSON array of UUIDs
    dropoff_furniture_ids: Optional[str] = None  # JSON array of UUIDs


class RouteCreate(RouteBase):
    """Schema for creating a route."""

    pass


class RouteUpdate(BaseModel):
    """Schema for updating a route."""

    date: Optional[datetime] = None
    status: Optional[str] = None
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
    """Donor business fields."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class DonorCreate(DonorBase):
    """Schema for creating a donor."""

    pass


class DonorUpdate(BaseModel):
    """Schema for updating a donor."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class Donor(DonorBase):
    """Response schema for donor."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Donation Schemas ============


class DonationBase(BaseModel):
    """Donation business fields."""

    donor_id: str
    donation_type: Optional[str] = None  # person, charity, business, community_drive
    charitable_receipt_estimate: Optional[float] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[str] = None


class DonationCreate(DonationBase):
    """Schema for creating a donation."""

    pass


class DonationUpdate(BaseModel):
    """Schema for updating a donation."""

    donor_id: Optional[str] = None
    donation_type: Optional[str] = None
    charitable_receipt_estimate: Optional[float] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[str] = None


class Donation(DonationBase):
    """Response schema for donation."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Client Schemas ============


class ClientBase(BaseModel):
    """Client business fields."""

    first_name: str
    last_name: str
    phone: Optional[str] = None
    phone_notes: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[str] = None  # female, male, other, prefer_not_to_say
    family_type: str  # single, family
    num_children: int
    num_adults: int
    coordinated_access_required: bool = False
    agency_id: Optional[str] = None
    immigration_status: Optional[str] = None  # PR, Refugee, Canadian citizen


class ClientCreate(ClientBase):
    """Schema for creating a client."""

    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    birthday: Optional[date] = None
    gender: Optional[str] = None
    phone_notes: Optional[str] = None
    family_type: Optional[str] = None
    num_children: Optional[int] = None
    num_adults: Optional[int] = None
    coordinated_access_required: Optional[bool] = None
    agency_id: Optional[str] = None
    immigration_status: Optional[str] = None


class Client(ClientBase):
    """Response schema for client."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Furniture Schemas ============


class FurnitureBase(BaseModel):
    """Furniture business fields."""

    name: str
    image_url: Optional[str] = None
    description: Optional[str] = None
    date_donated: Optional[datetime] = None
    date_received: Optional[datetime] = None
    address_pickup: Optional[str] = None
    address_dropoff: Optional[str] = None
    client_id: Optional[str] = None
    change_log: Optional[str] = None  # JSON array of strings
    route_id: Optional[str] = None
    referral_id: Optional[str] = None
    condition: Optional[str] = None  # excellent, good, fair, poor
    colour: Optional[str] = None
    category: Optional[str] = None
    smoking_household: Optional[bool] = None
    donation_id: Optional[str] = None
    status: str  # PICKUP_PENDING, APPROVED, OFFERED, SCHEDULED, DELIVERED, CLOSED


class FurnitureCreate(FurnitureBase):
    """Schema for creating furniture."""

    pass


class FurnitureUpdate(BaseModel):
    """Schema for updating furniture."""

    name: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    date_donated: Optional[datetime] = None
    date_received: Optional[datetime] = None
    address_pickup: Optional[str] = None
    address_dropoff: Optional[str] = None
    client_id: Optional[str] = None
    change_log: Optional[str] = None
    route_id: Optional[str] = None
    referral_id: Optional[str] = None
    condition: Optional[str] = None
    colour: Optional[str] = None
    category: Optional[str] = None
    smoking_household: Optional[bool] = None
    donation_id: Optional[str] = None
    status: Optional[str] = None


class Furniture(FurnitureBase):
    """Response schema for furniture."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Referral Schemas ============


class ReferralBase(BaseModel):
    """Referral business fields."""

    # Client / furniture selected
    client_id: str
    requested_items: list[Any]  # furniture selected (JSON)

    # Agent information
    agent_id: Optional[str] = None
    secondary_agent_id: Optional[str] = None
    agents_present_during_delivery: Optional[bool] = None

    # Referral details
    is_priority: bool = False
    priority_description: Optional[str] = None

    # Reasons (check all that apply)
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
    reason_other_info: Optional[str] = None  # Other description

    # Delivery details
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    postal_code: Optional[str] = None
    date_items_needed: Optional[datetime] = None
    staircases: Optional[bool] = None
    narrow_passageways: Optional[bool] = None
    adequate_parking: Optional[bool] = None
    move_other_info: Optional[str] = None  # Other (text field)
    notes_and_instructions: Optional[str] = None

    status: str  # pending, approved, completed, declined


class ReferralCreate(ReferralBase):
    """Schema for creating a referral."""

    pass


class ReferralUpdate(BaseModel):
    """Schema for updating a referral."""

    client_id: Optional[str] = None
    requested_items: Optional[list[Any]] = None

    agent_id: Optional[str] = None
    secondary_agent_id: Optional[str] = None
    agents_present_during_delivery: Optional[bool] = None

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

    status: Optional[str] = None


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
