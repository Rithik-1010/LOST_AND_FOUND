from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models import User, Item, Claim
from app.schemas import UserProfileResponse, ItemResponse, ClaimResponse
from app.api.v1.items import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch user items
    item_stmt = (
        select(Item)
        .options(
            selectinload(Item.category),
            selectinload(Item.zone),
            selectinload(Item.claims).selectinload(Claim.claimant),
        )
        .where(Item.user_id == current_user.id)
        .order_by(Item.created_at.desc())
    )
    items_result = await db.execute(item_stmt)
    user_items = items_result.scalars().all()

    # Fetch user claims
    claim_stmt = (
        select(Claim)
        .options(
            selectinload(Claim.item),
            selectinload(Claim.claimant),
        )
        .where(Claim.claimant_id == current_user.id)
        .order_by(Claim.created_at.desc())
    )
    claims_result = await db.execute(claim_stmt)
    user_claims = claims_result.scalars().all()

    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        department=current_user.department,
        year=current_user.year,
        role=current_user.role,
        karma=current_user.karma,
        is_banned=current_user.is_banned,
        created_at=current_user.created_at,
        items=user_items,
        claims=user_claims,
    )
