"""Referrals REST API."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Referral
from ..schemas import Referral as ReferralSchema
from ..schemas import ReferralCreate, ReferralUpdate
from ..services import referrals_service

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
async def list_referrals(db: AsyncSession = Depends(get_db)):
    return await referrals_service.list_referrals(db)


@router.post("", response_model=ReferralSchema, status_code=status.HTTP_201_CREATED)
async def create_referral(payload: ReferralCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await referrals_service.create_referral(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{referral_id}", response_model=ReferralSchema)
async def get_referral(referral: Referral = Depends(get_referral_or_404)):
    return referral


@router.put("/{referral_id}", response_model=ReferralSchema)
async def update_referral(
    payload: ReferralUpdate,
    referral: Referral = Depends(get_referral_or_404),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await referrals_service.update_referral(db, referral, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


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
