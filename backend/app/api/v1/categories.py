from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models import Category
from app.schemas import CategoryResponse, CategoryCreate

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name.asc()))
    return result.scalars().all()

@router.post("/", response_model=CategoryResponse)
async def create_category(category_in: CategoryCreate, db: AsyncSession = Depends(get_db)):
    new_cat = Category(**category_in.model_dump())
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    return new_cat
