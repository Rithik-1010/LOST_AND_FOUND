from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.models import Item, User, ItemType, ItemStatus, Claim, ClaimStatus
from app.schemas import (
    ItemCreate,
    ItemResponse,
    ItemDetailResponse,
    ItemStatusUpdate,
    ClaimCreate,
    ClaimResponse,
)

router = APIRouter()

# Dependency to get current user (Mock user for demonstration & Phase 1)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == "student@college.edu"))
    user = result.scalars().first()
    if not user:
        user = User(
            name="Alex Student",
            email="student@college.edu",
            department="Computer Science",
            year="Senior",
            karma=120,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.get("/", response_model=List[ItemResponse])
async def get_items(
    item_type: Optional[ItemType] = Query(None, alias="type"),
    category_id: Optional[int] = Query(None),
    zone_id: Optional[int] = Query(None),
    status: Optional[ItemStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Item)
        .options(
            selectinload(Item.user),
            selectinload(Item.category),
            selectinload(Item.zone),
        )
        .order_by(Item.created_at.desc())
    )

    if item_type:
        query = query.where(Item.type == item_type)
    if category_id:
        query = query.where(Item.category_id == category_id)
    if zone_id:
        query = query.where(Item.zone_id == zone_id)
    if status:
        query = query.where(Item.status == status)
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Item.title.ilike(search_filter))
            | (Item.description.ilike(search_filter))
            | (Item.brand.ilike(search_filter))
            | (Item.color.ilike(search_filter))
        )

    result = await db.execute(query)
    items = result.scalars().all()
    return items


@router.post("/", response_model=ItemResponse)
async def create_item(
    item_in: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_item = Item(**item_in.model_dump(), user_id=current_user.id)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)

    # Load relationships for clean serialization
    stmt = (
        select(Item)
        .options(
            selectinload(Item.user),
            selectinload(Item.category),
            selectinload(Item.zone),
        )
        .where(Item.id == new_item.id)
    )
    result = await db.execute(stmt)
    return result.scalars().first()


@router.get("/{item_id}", response_model=ItemDetailResponse)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Item)
        .options(
            selectinload(Item.user),
            selectinload(Item.category),
            selectinload(Item.zone),
            selectinload(Item.claims).selectinload(Claim.claimant),
        )
        .where(Item.id == item_id)
    )
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.patch("/{item_id}/status", response_model=ItemResponse)
async def update_item_status(
    item_id: int,
    status_update: ItemStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Item)
        .options(
            selectinload(Item.user),
            selectinload(Item.category),
            selectinload(Item.zone),
        )
        .where(Item.id == item_id)
    )
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.status = status_update.status
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Item).where(Item.id == item_id)
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    await db.commit()
    return {"message": "Item deleted successfully"}


@router.post("/{item_id}/claims", response_model=ClaimResponse)
async def create_claim(
    item_id: int,
    claim_in: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Item).where(Item.id == item_id)
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Save answers / proof info
    answers_data = {
        "proof_description": claim_in.proof_description,
        "contact_info": claim_in.contact_info,
        **(claim_in.answers_json or {}),
    }

    new_claim = Claim(
        item_id=item_id,
        claimant_id=current_user.id,
        answers_json=answers_data,
        status=ClaimStatus.pending,
    )
    db.add(new_claim)

    # Optionally update item status to claim_requested if currently lost or found
    if item.status in [ItemStatus.lost, ItemStatus.found]:
        item.status = ItemStatus.claim_requested

    await db.commit()
    await db.refresh(new_claim)

    # Eager load claimant for response
    claim_stmt = (
        select(Claim)
        .options(selectinload(Claim.claimant))
        .where(Claim.id == new_claim.id)
    )
    claim_result = await db.execute(claim_stmt)
    return claim_result.scalars().first()


@router.get("/{item_id}/claims", response_model=List[ClaimResponse])
async def get_item_claims(
    item_id: int,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Claim)
        .options(selectinload(Claim.claimant))
        .where(Claim.item_id == item_id)
        .order_by(Claim.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()
