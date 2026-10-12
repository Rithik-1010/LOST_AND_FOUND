from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.models import Claim, Item, User, ClaimStatus, ItemStatus
from app.schemas import ClaimResponse, ClaimStatusUpdate
from app.api.v1.items import get_current_user

router = APIRouter()

@router.get("/my-claims", response_model=List[ClaimResponse])
async def get_my_claims(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Claim)
        .options(
            selectinload(Claim.claimant),
            selectinload(Claim.item),
        )
        .where(Claim.claimant_id == current_user.id)
        .order_by(Claim.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/{claim_id}/status", response_model=ClaimResponse)
async def update_claim_status(
    claim_id: int,
    status_update: ClaimStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Claim)
        .options(
            selectinload(Claim.claimant),
            selectinload(Claim.item),
        )
        .where(Claim.id == claim_id)
    )
    result = await db.execute(stmt)
    claim = result.scalars().first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = status_update.status
    claim.reviewed_by = current_user.id

    # If approved, update item status and award karma
    if status_update.status == ClaimStatus.approved:
        if claim.item:
            claim.item.status = ItemStatus.verified
        current_user.karma += 50
    elif status_update.status == ClaimStatus.handed_over:
        if claim.item:
            claim.item.status = ItemStatus.returned
        current_user.karma += 25

    await db.commit()
    await db.refresh(claim)
    return claim
