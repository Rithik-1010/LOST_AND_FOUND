from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models import Zone
from app.schemas import ZoneResponse, ZoneCreate

router = APIRouter()

@router.get("/", response_model=List[ZoneResponse])
async def get_zones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Zone).order_by(Zone.name.asc()))
    return result.scalars().all()

@router.post("/", response_model=ZoneResponse)
async def create_zone(zone_in: ZoneCreate, db: AsyncSession = Depends(get_db)):
    new_zone = Zone(**zone_in.model_dump())
    db.add(new_zone)
    await db.commit()
    await db.refresh(new_zone)
    return new_zone
