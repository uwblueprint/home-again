"""Referrals REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Referral
from ..enums import ReferralItemStatus
from ..schemas import Referral as ReferralSchema
from ..schemas import ReferralCreate, ReferralItem, ReferralItemReject, ReferralUpdate
from ..services import inventory_service, referrals_service

router = APIRouter()


async def get_referral_or_404(
    referral_id: str, db: AsyncSession = Depends(get_db)
) -> Referral:
    referral = await referrals_service.get_referral(db, referral_id)
    if not referral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Referral not found"
        )
    return referral


@router.get("", response_model=list[ReferralSchema])
async def list_referrals(
    client_id: str | None = None, db: AsyncSession = Depends(get_db)
):
    referrals = await referrals_service.list_referrals(db, client_id=client_id)
    return [referrals_service.build_referral(r) for r in referrals]


@router.post("", response_model=ReferralSchema, status_code=status.HTTP_201_CREATED)
async def create_referral(payload: ReferralCreate, db: AsyncSession = Depends(get_db)):
    try:
        referral = await referrals_service.create_referral(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return referrals_service.build_referral(referral)


@router.get("/{referral_id}", response_model=ReferralSchema)
async def get_referral(referral: Referral = Depends(get_referral_or_404)):
    return referrals_service.build_referral(referral)


@router.put("/{referral_id}", response_model=ReferralSchema)
async def update_referral(
    payload: ReferralUpdate,
    referral: Referral = Depends(get_referral_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        updated = await referrals_service.update_referral(db, referral, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return referrals_service.build_referral(updated)


@router.delete("/{referral_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_referral(
    referral: Referral = Depends(get_referral_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        await referrals_service.delete_referral(db, referral)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


async def _review_item(
    db: AsyncSession,
    referral: Referral,
    item_id: str,
    item_status: ReferralItemStatus,
    rejection_reason: str | None = None,
):
    try:
        return await referrals_service.review_item(
            db, referral, item_id, item_status, rejection_reason
        )
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except inventory_service.OutOfStockError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{referral_id}/items/{item_id}/approve", response_model=ReferralItem)
async def approve_item(
    item_id: str,
    referral: Referral = Depends(get_referral_or_404),
    db: AsyncSession = Depends(get_db),
):
    return await _review_item(db, referral, item_id, ReferralItemStatus.APPROVED)


@router.post("/{referral_id}/items/{item_id}/reject", response_model=ReferralItem)
async def reject_item(
    item_id: str,
    payload: ReferralItemReject,
    referral: Referral = Depends(get_referral_or_404),
    db: AsyncSession = Depends(get_db),
):
    return await _review_item(
        db,
        referral,
        item_id,
        ReferralItemStatus.REJECTED,
        payload.rejection_reason,
    )
