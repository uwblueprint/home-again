"""
SQLAlchemy ORM models.

Defines the database schema and relationships using SQLAlchemy 2.0 async patterns.
Authentication is handled by Supabase; Admin/Agent link via supabase_user_id.

@see https://docs.sqlalchemy.org/en/20/orm/
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from ..database import Base
from ..enums import FurnitureStatus  # noqa: F401 — re-exported for backward compat


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------


class Admin(Base):
    """Home Again admin user. Auth via Supabase; supabase_user_id links to Supabase Auth."""

    __tablename__ = "admins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    supabase_user_id = Column(String(255), unique=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )


# ---------------------------------------------------------------------------
# Agency
# ---------------------------------------------------------------------------


class Agency(Base):
    """Partner organization. Main contact stored as name fields directly on the record.
    Agents can have is_admin=True to designate admin-level access within the agency."""

    __tablename__ = "agencies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    postal_code = Column(String(10), nullable=False)
    phone_number = Column(String(20), nullable=False)
    program = Column(String(255), nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    agents = relationship(
        "Agent", back_populates="agency", foreign_keys="Agent.agency_id"
    )
    clients = relationship(
        "Client", back_populates="agency", foreign_keys="Client.agency_id"
    )


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------


class Agent(Base):
    """Agency agent/worker. is_admin=True grants admin-level permissions."""

    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agency_id = Column(String(36), ForeignKey("agencies.id"), nullable=False)
    supabase_user_id = Column(String(255), unique=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    is_admin = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    agency = relationship("Agency", back_populates="agents", foreign_keys=[agency_id])


# ---------------------------------------------------------------------------
# Donor
# ---------------------------------------------------------------------------


class Donor(Base):
    """Donor who provides furniture."""

    __tablename__ = "donors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    donations = relationship("Donation", back_populates="donor")


# ---------------------------------------------------------------------------
# Donation
# ---------------------------------------------------------------------------


class Donation(Base):
    """Donation event — the source for one or more furniture items."""

    __tablename__ = "donations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    donor_id = Column(String(36), ForeignKey("donors.id"), nullable=False)
    donation_type = Column(String(50), nullable=True)  # See DonationTypeEnum
    charitable_receipt_estimate = Column(Float, nullable=True)
    address_line_1 = Column(String(255), nullable=True)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(10), nullable=True)
    status = Column(String(50), nullable=True)  # See DonationStatus
    # Household questions are asked once on the donor form, so they live at the
    # donation level. Furniture carries its own copy for items routed onward.
    smoking_household = Column(Boolean, nullable=True)
    has_pets = Column(Boolean, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    donor = relationship("Donor", back_populates="donations")
    furniture_items = relationship("Furniture", back_populates="donation")
    pickups = relationship("Pickup", back_populates="donation")


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------


class Client(Base):
    """Client who receives furniture."""

    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    birthday = Column(Date, nullable=False)
    gender = Column(String(20), nullable=True)  # See GenderEnum
    phone = Column(String(20), nullable=True)
    phone_notes = Column(Text, nullable=True)
    speaks_english = Column(Boolean, nullable=False, default=True)
    language = Column(
        String(100), nullable=True
    )  # Primary language if speaks_english=False
    family_type = Column(String(20), nullable=False)  # See FamilyTypeEnum
    num_children = Column(Integer, nullable=False, default=0)
    num_adults = Column(Integer, nullable=False, default=1)
    coordinated_access_required = Column(Boolean, nullable=False, default=False)
    agency_id = Column(String(36), ForeignKey("agencies.id"), nullable=True)
    immigration_status = Column(String(50), nullable=True)  # See ImmigrationStatusEnum
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    agency = relationship("Agency", back_populates="clients", foreign_keys=[agency_id])
    referrals = relationship("Referral", back_populates="client")


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


class Route(Base):
    """Dispatch run for a given date. Contains Pickup and Dropoff stops."""

    __tablename__ = "routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=True)  # See RouteStatus
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    pickups = relationship("Pickup", back_populates="route")
    dropoffs = relationship("Dropoff", back_populates="route")


# ---------------------------------------------------------------------------
# Pickup
# ---------------------------------------------------------------------------


class Pickup(Base):
    """A pickup stop on a route where furniture is collected from a donor."""

    __tablename__ = "pickups"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    # Nullable: an admin schedules a pickup against a donation during review,
    # before dispatch assigns it to a route.
    route_id = Column(String(36), ForeignKey("routes.id"), nullable=True)
    donation_id = Column(String(36), ForeignKey("donations.id"), nullable=True)
    scheduled_date = Column(DateTime, nullable=True)
    note = Column(Text, nullable=True)
    # Set when the donor has been sent — and the admin has confirmed — the date.
    confirmed_at = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    route = relationship("Route", back_populates="pickups")
    donation = relationship("Donation", back_populates="pickups")
    furniture_items = relationship("Furniture", back_populates="pickup")


# ---------------------------------------------------------------------------
# Furniture
# ---------------------------------------------------------------------------


class Furniture(Base):
    """Individual furniture item."""

    __tablename__ = "furniture"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    condition = Column(String(50), nullable=True)  # See FurnitureConditionEnum
    colour = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    smoking_household = Column(Boolean, nullable=False, default=False)
    has_pets = Column(Boolean, nullable=False, default=False)
    status = Column(String(50), nullable=False)  # See FurnitureStatus
    # Set only when status is REJECTED. See FurnitureRejectionReason;
    # rejection_details is required when the reason is OTHER.
    rejection_reason = Column(String(50), nullable=True)
    rejection_details = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    donation_id = Column(String(36), ForeignKey("donations.id"), nullable=True)
    referral_id = Column(String(36), ForeignKey("referrals.id"), nullable=True)
    pickup_id = Column(String(36), ForeignKey("pickups.id"), nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    donation = relationship("Donation", back_populates="furniture_items")
    referral = relationship("Referral", back_populates="furniture_items")
    pickup = relationship("Pickup", back_populates="furniture_items")
    dropoff = relationship("Dropoff", back_populates="furniture", uselist=False)
    photos = relationship(
        "FurniturePhoto",
        back_populates="furniture",
        cascade="all, delete-orphan",
        order_by="FurniturePhoto.position",
    )


# ---------------------------------------------------------------------------
# Furniture photo
# ---------------------------------------------------------------------------


class FurniturePhoto(Base):
    """
    One photo of a furniture item.

    Donors upload several photos per item and the review UI shows them in order,
    so photos live in their own table rather than on Furniture.image_url (which
    stays as the single thumbnail).
    """

    __tablename__ = "furniture_photos"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    furniture_id = Column(String(36), ForeignKey("furniture.id"), nullable=False)
    url = Column(String(500), nullable=False)
    position = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    furniture = relationship("Furniture", back_populates="photos")


# ---------------------------------------------------------------------------
# Referral
# ---------------------------------------------------------------------------


class Referral(Base):
    """Client referral for furniture delivery."""

    __tablename__ = "referrals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    # Client
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    # Furniture selected (JSON array of item descriptors)
    requested_items = Column(Text, nullable=False)
    # Agent information
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True)
    secondary_agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True)
    agents_present_during_delivery = Column(Boolean, nullable=True)
    program = Column(String(255), nullable=True)
    # Referral details
    is_priority = Column(Boolean, default=False)
    priority_description = Column(Text, nullable=True)
    # Reason flags
    reason_low_income = Column(Boolean, default=False)
    reason_exiting_homelessness = Column(Boolean, default=False)
    reason_new_to_community = Column(Boolean, default=False)
    previous_city_town_country = Column(Text, nullable=True)
    reason_escaping_abuse = Column(Boolean, default=False)
    reason_mental_health = Column(Boolean, default=False)
    reason_exiting_prison = Column(Boolean, default=False)
    reason_physical_disability = Column(Boolean, default=False)
    reason_health_issues = Column(Boolean, default=False)
    reason_other = Column(Boolean, default=False)
    reason_other_info = Column(Text, nullable=True)
    # Delivery details
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    postal_code = Column(String(10), nullable=True)
    date_items_needed = Column(DateTime, nullable=True)
    staircases = Column(Boolean, nullable=True)
    narrow_passageways = Column(Boolean, nullable=True)
    adequate_parking = Column(Boolean, nullable=True)
    move_other_info = Column(Text, nullable=True)
    notes_and_instructions = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)  # See ReferralStatus
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    client = relationship("Client", back_populates="referrals")
    agent = relationship("Agent", foreign_keys=[agent_id])
    secondary_agent = relationship("Agent", foreign_keys=[secondary_agent_id])
    furniture_items = relationship("Furniture", back_populates="referral")
    dropoffs = relationship("Dropoff", back_populates="referral")


# ---------------------------------------------------------------------------
# Dropoff
# ---------------------------------------------------------------------------


class Dropoff(Base):
    """A dropoff stop on a route where furniture is delivered to a client."""

    __tablename__ = "dropoffs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_id = Column(String(36), ForeignKey("routes.id"), nullable=False)
    furniture_id = Column(String(36), ForeignKey("furniture.id"), nullable=False)
    referral_id = Column(String(36), ForeignKey("referrals.id"), nullable=True)
    high_priority = Column(Boolean, nullable=False, default=False)
    contact_in_case_of_cancellation = Column(Boolean, nullable=False, default=False)
    dispatch_required = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    # Relationships
    route = relationship("Route", back_populates="dropoffs")
    furniture = relationship("Furniture", back_populates="dropoff")
    referral = relationship("Referral", back_populates="dropoffs")
