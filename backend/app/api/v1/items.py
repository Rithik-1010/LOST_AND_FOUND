from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models import Item, User
from app.schemas import ItemCreate, ItemResponse

router = APIRouter()

# Dependency to get current user (Mocked for Phase 1)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    # In reality, this would decode a JWT token.
    # We will just get or create a mock user for now.
    result = await db.execute(select(User).where(User.email == "mock@college.edu"))
    user = result.scalars().first()
    if not user:
        user = User(name="Mock User", email="mock@college.edu", department="CSE", year="2")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

@router.get("/", response_model=List[ItemResponse])
async def get_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).order_by(Item.created_at.desc()))
    items = result.scalars().all()
    return items

@router.post("/", response_model=ItemResponse)
async def create_item(
    item_in: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_item = Item(**item_in.model_dump(), user_id=current_user.id)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
