"""
SQLAlchemy ORM models.

These models define the database schema and relationships.
Using SQLAlchemy 2.0 async patterns for non-blocking operations.
Authentication is handled by Supabase; Admin/Agent link via supabase_user_id.

@see https://docs.sqlalchemy.org/en/20/orm/
"""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (Boolean, Column, Date, DateTime, Float, ForeignKey,
                        Integer, String, Text)
from sqlalchemy.orm import relationship

from ..database import Base


def generate_uuid() -> str:
    """Generate a UUID for IDs."""
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class FurnitureStatusEnum(str, enum.Enum):
    PICKUP_PENDING = "PICKUP_PENDING"
    APPROVED = "APPROVED"
    OFFERED = "OFFERED"
    SCHEDULED = "SCHEDULED"
    DELIVERED = "DELIVERED"
    CLOSED = "CLOSED"


# ---------------------------------------------------------------------------
# Admin (Supabase Auth; link via supabase_user_id)
# ---------------------------------------------------------------------------


class Admin(Base):
    """Home Again admin user. Auth via Supabase; supabase_user_id links to Supabase Auth."""

    __tablename__ = "admins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    supabase_user_id = Column(String(255), unique=True, nullable=True)
    phone_number = Column(String(20), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---------------------------------------------------------------------------
# Agency
# ---------------------------------------------------------------------------


class Agency(Base):
    """Agency model for partner organizations."""

    __tablename__ = "agencies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    postal_code = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=False)
    main_agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # Two FK paths between Agency and Agent: Agent.agency_id and Agency.main_agent_id
    main_agent = relationship("Agent", foreign_keys=[main_agent_id])
    agents = relationship(
        "Agent", back_populates="agency", primaryjoin="Agent.agency_id == Agency.id"
    )
    clients = relationship(
        "Client", back_populates="agency", foreign_keys="Client.agency_id"
    )


# ---------------------------------------------------------------------------
# Agent (belongs to Agency; Supabase Auth via supabase_user_id)
# ---------------------------------------------------------------------------


class Agent(Base):
    """Agency agent. Auth via Supabase; supabase_user_id links to Supabase Auth."""

    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agency_id = Column(String(36), ForeignKey("agencies.id"), nullable=False)
    supabase_user_id = Column(String(255), unique=True, nullable=True)
    phone_number = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # Disambiguate: Agent.agency uses Agent.agency_id -> Agency.id
    agency = relationship(
        "Agency",
        back_populates="agents",
        foreign_keys=[agency_id],
    )


# ---------------------------------------------------------------------------
# Donor
# ---------------------------------------------------------------------------


class Donor(Base):
    """Donor model."""

    __tablename__ = "donors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donations = relationship("Donation", back_populates="donor")


class Donation(Base):
    """Donation event (source for furniture items)."""

    __tablename__ = "donations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    donor_id = Column(String(36), ForeignKey("donors.id"), nullable=False)
    donation_type = Column(
        String(50), nullable=True
    )  # person, charity, business, community_drive
    charitable_receipt_estimate = Column(Float, nullable=True)
    address_line_1 = Column(String(255), nullable=True)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(10), nullable=True)
    status = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donor = relationship("Donor", back_populates="donations")
    furniture_items = relationship("Furniture", back_populates="donation")


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------


class Client(Base):
    """Client model."""

    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    agency_id = Column(String(36), ForeignKey("agencies.id"), nullable=True)
    birthday = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)  # female, male, other, prefer_not_to_say
    phone_notes = Column(Text, nullable=True)
    family_type = Column(String(20), nullable=False)  # single, family
    num_children = Column(Integer, nullable=False, default=0)
    num_adults = Column(Integer, nullable=False, default=1)
    coordinated_access_required = Column(Boolean, nullable=False, default=False)
    immigration_status = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency = relationship("Agency", back_populates="clients", foreign_keys=[agency_id])
    referrals = relationship("Referral", back_populates="client")


# ---------------------------------------------------------------------------
# Route (dispatch: pickup/dropoff lists of furniture)
# ---------------------------------------------------------------------------


class Route(Base):
    """Route for a dispatch run: date and lists of furniture for pickup/dropoff."""

    __tablename__ = "routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=True)
    pickup_furniture_ids = Column(Text, nullable=True)  # JSON array of furniture UUIDs
    dropoff_furniture_ids = Column(Text, nullable=True)  # JSON array of furniture UUIDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---------------------------------------------------------------------------
# Furniture
# ---------------------------------------------------------------------------


class Furniture(Base):
    """Furniture item."""

    __tablename__ = "furniture"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    status = Column(
        String(50), nullable=False
    )  # PICKUP_PENDING, APPROVED, OFFERED, SCHEDULED, DELIVERED, CLOSED
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    condition = Column(String(50), nullable=True)  # excellent, good, fair, poor
    colour = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)
    smoking_household = Column(Boolean, nullable=True)
    donation_id = Column(String(36), ForeignKey("donations.id"), nullable=True)
    referral_id = Column(String(36), ForeignKey("referrals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donation = relationship("Donation", back_populates="furniture_items")
    referral = relationship("Referral", back_populates="furniture_items")


# ---------------------------------------------------------------------------
# Referral
# ---------------------------------------------------------------------------


class Referral(Base):
    """Referral model for client requests."""

    __tablename__ = "referrals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    status = Column(
        String(50), nullable=False
    )  # pending, approved, completed, declined
    requested_items = Column(
        Text, nullable=False
    )  # JSON array of furniture item requests (furniture selected)
    # Agent information
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True)
    secondary_agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True)
    agents_present_during_delivery = Column(Boolean, nullable=True)
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
    move_other_info = Column(Text, nullable=True)  # "Other" text field
    notes_and_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="referrals")
    agent = relationship("Agent", foreign_keys=[agent_id])
    secondary_agent = relationship("Agent", foreign_keys=[secondary_agent_id])
    furniture_items = relationship("Furniture", back_populates="referral")
