from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..schemas import Referral as ReferralSchema
from ..schemas import ReferralCreate, ReferralUpdate
from ..services import referrals as referrals_service
from .dependencies import require_bearer_token

router = APIRouter(dependencies=[Depends(require_bearer_token)])


@router.get("", response_model=list[ReferralSchema], status_code=status.HTTP_200_OK)
async def list_referrals(db: AsyncSession = Depends(get_db)):
    return await referrals_service.list_referrals(db)


@router.post("", response_model=ReferralSchema, status_code=status.HTTP_201_CREATED)
async def create_referral(
    payload: ReferralCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        return await referrals_service.create_referral(db, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from e


@router.get("/{id}", response_model=ReferralSchema, status_code=status.HTTP_200_OK)
async def get_referral(
    id: str,
    db: AsyncSession = Depends(get_db),
):
    referral = await referrals_service.get_referral(db, id)
    if not referral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referral not found",
        )
    return referral


@router.put("/{id}", response_model=ReferralSchema, status_code=status.HTTP_200_OK)
async def update_referral(
    id: str,
    payload: ReferralUpdate,
    db: AsyncSession = Depends(get_db),
):
    referral = await referrals_service.get_referral(db, id)
    if not referral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referral not found",
        )

    try:
        return await referrals_service.update_referral(db, referral, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from e


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_referral(
    id: str,
    db: AsyncSession = Depends(get_db),
):
    referral = await referrals_service.get_referral(db, id)
    if not referral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referral not found",
        )

    try:
        await referrals_service.delete_referral(db, referral)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from e

    return Response(status_code=status.HTTP_204_NO_CONTENT)
