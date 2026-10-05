import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, engine
from app.models import User, Item, Zone, Category, ItemType
from app.core.database import Base

async def seed_db():
    async with engine.begin() as conn:
        # Create all tables (useful for dev if not using migrations)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # 1. Create Zone
        zone = Zone(name="Main Library", lat=12.9716, lng=77.5946)
        db.add(zone)
        
        # 2. Create Category
        cat = Category(name="Electronics", icon="laptop")
        db.add(cat)
        
        # 3. Create User
        user = User(name="Test User", email="test@college.edu", department="CSE", year="3")
        db.add(user)
        
        await db.commit()
        await db.refresh(zone)
        await db.refresh(cat)
        await db.refresh(user)

        # 4. Create Items
        item1 = Item(
            user_id=user.id,
            type=ItemType.lost,
            title="MacBook Air M1",
            description="Silver MacBook lost near the cafe.",
            category_id=cat.id,
            zone_id=zone.id,
            color="Silver",
            brand="Apple"
        )
        item2 = Item(
            user_id=user.id,
            type=ItemType.found,
            title="Black Umbrella",
            description="Found a black umbrella at the library entrance.",
            category_id=cat.id,
            zone_id=zone.id,
            color="Black"
        )
        db.add_all([item1, item2])
        await db.commit()
        print("Database seeded successfully with sample data!")

if __name__ == "__main__":
    asyncio.run(seed_db())
