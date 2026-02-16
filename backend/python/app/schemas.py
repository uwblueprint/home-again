"""
Pydantic schemas for request/response validation.

These schemas define the contract between frontend and backend.
All API endpoints use these for type safety and automatic OpenAPI documentation.

@see https://docs.pydantic.dev/latest/
"""

import json
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

# ============ Agency Schemas ============


class AgencyBase(BaseModel):
    """Base agency data."""

    name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    province: str


class AgencyCreate(AgencyBase):
    """Schema for creating an agency."""

    pass


class AgencyUpdate(BaseModel):
    """Schema for updating an agency."""

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None


class Agency(AgencyBase):
    """Response schema for agency."""

    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# ============ Donor Schemas ============


class DonorBase(BaseModel):
    """Base donor data."""

    name: str
    email: EmailStr
    phone: str


class DonorCreate(DonorBase):
    """Schema for creating a donor."""

    pass


class DonorUpdate(BaseModel):
    """Schema for updating a donor."""

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class Donor(DonorBase):
    """Response schema for donor."""

    id: str
    itemsDonated: int
    lastDonationDate: Optional[datetime]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# ============ Client Schemas ============


class ClientBase(BaseModel):
    """Base client data."""

    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    address: str
    city: str
    province: str


class ClientCreate(ClientBase):
    """Schema for creating a client."""

    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client."""

    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None


class Client(ClientBase):
    """Response schema for client."""

    id: str
    agencyId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# ============ Inventory Schemas ============


class InventoryItemBase(BaseModel):
    """Base inventory item data."""

    name: str
    category: str
    quantity: int
    condition: str  # "excellent" | "good" | "fair" | "poor"
    donorId: str
    dateReceived: datetime


class InventoryItemCreate(InventoryItemBase):
    """Schema for creating an inventory item."""

    pass


class InventoryItem(InventoryItemBase):
    """Response schema for inventory item."""

    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# ============ Referral Schemas ============


class ReferralBase(BaseModel):
    """Base referral data."""

    clientId: str
    agencyId: str
    status: str  # "pending" | "approved" | "completed" | "declined"
    requestedItems: list[str]


class ReferralCreate(ReferralBase):
    """Schema for creating a referral."""

    pass


class Referral(ReferralBase):
    """Response schema for referral."""

    id: str
    createdAt: datetime
    updatedAt: datetime

    @field_validator("requestedItems", mode="before")
    @classmethod
    def parse_requested_items(cls, v):
        """Parse requestedItems from JSON string when loading from ORM."""
        if isinstance(v, str):
            return json.loads(v) if v else []
        return v

    class Config:
        from_attributes = True


# ============ Delivery Schemas ============


class DeliveryBase(BaseModel):
    """Base delivery data."""

    referralId: str
    deliveryDate: datetime
    status: str  # "scheduled" | "in_progress" | "completed" | "cancelled"
    notes: Optional[str] = None


class DeliveryCreate(DeliveryBase):
    """Schema for creating a delivery."""

    pass


class Delivery(DeliveryBase):
    """Response schema for delivery."""

    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
