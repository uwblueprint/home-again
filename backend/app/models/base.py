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
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    province = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=True)  # unprocessed, approved, deactivated
    require_pre_payment = Column(Boolean, default=False)
    billing_profiles = Column(
        Text, nullable=True
    )  # JSON array of billing profile objects
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agents = relationship("Agent", back_populates="agency")
    clients = relationship(
        "Client", back_populates="agency", foreign_keys="Client.agency_id"
    )
    referrals = relationship("Referral", back_populates="agency")


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
    alternate_phone = Column(String(20), nullable=True)
    extension = Column(String(10), nullable=True)
    location = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)  # active, inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency = relationship("Agency", back_populates="agents")


# ---------------------------------------------------------------------------
# Donor
# ---------------------------------------------------------------------------


class Donor(Base):
    """Donor model for furniture donors."""

    __tablename__ = "donors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(10), nullable=True)
    country = Column(String(100), nullable=True)
    smoking_household = Column(Boolean, nullable=True)
    donation_type = Column(
        String(50), nullable=True
    )  # person, charity, business, community_drive
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    furniture_donated = relationship("Furniture", back_populates="donor")


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------


class Client(Base):
    """Client model for recipients of furniture."""

    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=False)
    apartment_unit = Column(String(20), nullable=True)
    city = Column(String(100), nullable=False)
    province = Column(String(100), nullable=False)
    postal_code = Column(String(10), nullable=True)
    agency_id = Column(String(36), ForeignKey("agencies.id"), nullable=True)
    birthday = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)  # female, male, other, prefer_not_to_say
    phone_notes = Column(Text, nullable=True)
    family_type = Column(String(20), nullable=True)  # single, family
    num_children = Column(Integer, default=0)
    num_adults = Column(Integer, default=1)
    has_received_furniture_before = Column(Boolean, nullable=True)
    previous_referral_date = Column(DateTime, nullable=True)
    previous_referral_reason = Column(Text, nullable=True)
    additional_support_required = Column(Boolean, default=False)
    pending_delivery = Column(Boolean, default=False)
    last_delivery_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency = relationship("Agency", back_populates="clients", foreign_keys=[agency_id])
    referrals = relationship("Referral", back_populates="client")
    furniture_received = relationship("Furniture", back_populates="client")


# ---------------------------------------------------------------------------
# Route (dispatch: pickup/dropoff lists of furniture)
# ---------------------------------------------------------------------------


class Route(Base):
    """Route for a dispatch run: date and lists of furniture for pickup/dropoff."""

    __tablename__ = "routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(DateTime, nullable=False)
    pickup_furniture_ids = Column(Text, nullable=True)  # JSON array of furniture UUIDs
    dropoff_furniture_ids = Column(Text, nullable=True)  # JSON array of furniture UUIDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    furniture_pickups = relationship(
        "Furniture",
        foreign_keys="Furniture.dispatch_id",
        back_populates="dispatch",
    )


# ---------------------------------------------------------------------------
# Furniture
# ---------------------------------------------------------------------------


class Furniture(Base):
    """Furniture item (donated, in stock, or delivered)."""

    __tablename__ = "furniture"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    status = Column(
        String(50), nullable=False
    )  # PICKUP_PENDING, APPROVED, OFFERED, SCHEDULED, DELIVERED, CLOSED
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    date_donated = Column(DateTime, nullable=True)
    date_received = Column(DateTime, nullable=True)
    address_pickup = Column(String(255), nullable=True)
    address_dropoff = Column(String(255), nullable=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=True)
    change_log = Column(Text, nullable=True)  # JSON array of strings
    dispatch_id = Column(String(36), ForeignKey("routes.id"), nullable=True)
    condition = Column(String(50), nullable=True)  # excellent, good, fair, poor
    colour = Column(String(50), nullable=True)
    donor_id = Column(String(36), ForeignKey("donors.id"), nullable=False)
    category = Column(String(100), nullable=True)
    quantity = Column(Integer, default=1)
    smoking_household = Column(Boolean, nullable=True)
    donation_type = Column(
        String(50), nullable=True
    )  # person, charity, business, community_drive
    charitable_receipt_estimate = Column(Float, nullable=True)
    cash_cheque_amount = Column(Float, nullable=True)
    cash_cheque_note = Column(Text, nullable=True)
    admin_note = Column(Text, nullable=True)
    picked_up_or_dropped_off = Column(
        String(20), nullable=True
    )  # picked_up, dropped_off
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donor = relationship("Donor", back_populates="furniture_donated")
    client = relationship("Client", back_populates="furniture_received")
    dispatch = relationship(
        "Route", back_populates="furniture_pickups", foreign_keys=[dispatch_id]
    )


# ---------------------------------------------------------------------------
# Referral
# ---------------------------------------------------------------------------


class Referral(Base):
    """Referral model for client requests."""

    __tablename__ = "referrals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    agency_id = Column(String(36), ForeignKey("agencies.id"), nullable=False)
    status = Column(
        String(50), nullable=False
    )  # pending, approved, completed, declined
    requested_items = Column(
        Text, nullable=False
    )  # JSON array of furniture item requests
    # Admin-only
    dispatch_required = Column(Boolean, nullable=True)
    referral_date = Column(DateTime, nullable=True)
    is_priority = Column(Boolean, default=False)
    contact_in_case_of_cancellation = Column(Boolean, default=False)
    # Shared
    coordinated_access_required = Column(Boolean, default=False)
    date_items_needed = Column(DateTime, nullable=True)
    related_to_move = Column(Boolean, nullable=True)
    staircases = Column(Boolean, nullable=True)
    narrow_passageways = Column(Boolean, nullable=True)
    adequate_parking = Column(Boolean, nullable=True)
    move_other_info = Column(Text, nullable=True)
    # Reason flags
    reason_low_income = Column(Boolean, default=False)
    reason_exiting_homelessness = Column(Boolean, default=False)
    reason_new_to_community = Column(Boolean, default=False)
    reason_escaping_abuse = Column(Boolean, default=False)
    reason_mental_health = Column(Boolean, default=False)
    reason_exiting_prison = Column(Boolean, default=False)
    reason_physical_disability = Column(Boolean, default=False)
    reason_health_issues = Column(Boolean, default=False)
    reason_other = Column(Boolean, default=False)
    reason_other_info = Column(Text, nullable=True)
    # Secondary agent
    secondary_agent_name = Column(String(255), nullable=True)
    secondary_agent_email = Column(String(255), nullable=True)
    secondary_agent_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="referrals")
    agency = relationship("Agency", back_populates="referrals")
