"""
SQLAlchemy ORM models.

These models define the database schema and relationships.
Using SQLAlchemy 2.0 async patterns for non-blocking operations.

@see https://docs.sqlalchemy.org/en/20/orm/
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    Float,
    ForeignKey,
    Text,
    Boolean,
)
from sqlalchemy.orm import relationship
import uuid

from ..database import Base


def generate_uuid() -> str:
    """Generate a UUID for IDs."""
    return str(uuid.uuid4())


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
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    clients = relationship("Client", back_populates="agency")
    referrals = relationship("Referral", back_populates="agency")


class Donor(Base):
    """Donor model for furniture donors."""

    __tablename__ = "donors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(20), nullable=False)
    itemsDonated = Column(Integer, default=0)
    lastDonationDate = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    inventory = relationship("InventoryItem", back_populates="donor")


class Client(Base):
    """Client model for recipients of furniture."""

    __tablename__ = "clients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    province = Column(String(100), nullable=False)
    agencyId = Column(String(36), ForeignKey("agencies.id"))
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agency = relationship("Agency", back_populates="clients")
    referrals = relationship("Referral", back_populates="client")


class InventoryItem(Base):
    """InventoryItem model for tracking donated furniture."""

    __tablename__ = "inventory"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Integer, default=1)
    condition = Column(String(50), nullable=False)  # excellent, good, fair, poor
    donorId = Column(String(36), ForeignKey("donors.id"))
    dateReceived = Column(DateTime, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donor = relationship("Donor", back_populates="inventory")


class Referral(Base):
    """Referral model for client requests."""

    __tablename__ = "referrals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    clientId = Column(String(36), ForeignKey("clients.id"))
    agencyId = Column(String(36), ForeignKey("agencies.id"))
    status = Column(
        String(50), nullable=False
    )  # pending, approved, completed, declined
    requestedItems = Column(Text, nullable=False)  # JSON string
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="referrals")
    agency = relationship("Agency", back_populates="referrals")
    deliveries = relationship("Delivery", back_populates="referral")


class Delivery(Base):
    """Delivery model for tracking furniture delivery."""

    __tablename__ = "deliveries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    referralId = Column(String(36), ForeignKey("referrals.id"))
    deliveryDate = Column(DateTime, nullable=False)
    status = Column(
        String(50), nullable=False
    )  # scheduled, in_progress, completed, cancelled
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    referral = relationship("Referral", back_populates="deliveries")
