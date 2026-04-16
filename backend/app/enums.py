"""
Shared enum constants for the Home Again Furniture Bank API.

Import from here rather than defining inline string constants elsewhere.

Usage in models:
    # Column comment only — SQLAlchemy stores as String, enum enforced at app layer
    status = Column(String(50), nullable=False)  # See ReferralStatus

Usage in schemas:
    from .enums import ReferralStatus
    status: ReferralStatus
"""

import enum


# ---------------------------------------------------------------------------
# People / identity
# ---------------------------------------------------------------------------


class GenderEnum(str, enum.Enum):
    FEMALE = "female"
    MALE = "male"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class ImmigrationStatusEnum(str, enum.Enum):
    PR = "PR"
    REFUGEE = "Refugee"
    CANADIAN_CITIZEN = "Canadian citizen"


# ---------------------------------------------------------------------------
# Client / family
# ---------------------------------------------------------------------------


class FamilyTypeEnum(str, enum.Enum):
    SINGLE = "single"
    FAMILY = "family"


# ---------------------------------------------------------------------------
# Donation
# ---------------------------------------------------------------------------


class DonationTypeEnum(str, enum.Enum):
    PERSON = "person"
    CHARITY = "charity"
    BUSINESS = "business"
    COMMUNITY_DRIVE = "community_drive"


class DonationStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ---------------------------------------------------------------------------
# Furniture
# ---------------------------------------------------------------------------


class FurnitureStatus(str, enum.Enum):
    PICKUP_PENDING = "PICKUP_PENDING"
    APPROVED = "APPROVED"
    OFFERED = "OFFERED"
    SCHEDULED = "SCHEDULED"
    DELIVERED = "DELIVERED"
    CLOSED = "CLOSED"


class FurnitureConditionEnum(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


class RouteStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# ---------------------------------------------------------------------------
# Referral
# ---------------------------------------------------------------------------


class ReferralStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    COMPLETED = "completed"
    DECLINED = "declined"
