import asyncio
from datetime import datetime, timezone, timedelta
from app.core.database import AsyncSessionLocal, Base, engine
from app.models import User, Category, Zone, Item, Claim, ItemType, ItemStatus, ClaimStatus

CATEGORIES = [
    {"name": "Electronics", "icon": "laptop"},
    {"name": "IDs & Cards", "icon": "credit-card"},
    {"name": "Bags & Backpacks", "icon": "briefcase"},
    {"name": "Keys & Accessories", "icon": "key"},
    {"name": "Books & Stationery", "icon": "book-open"},
    {"name": "Clothing & Apparel", "icon": "shirt"},
    {"name": "Other", "icon": "help-circle"},
]

ZONES = [
    {"name": "Central Library", "lat": 12.9716, "lng": 77.5946},
    {"name": "Main Cafeteria", "lat": 12.9720, "lng": 77.5950},
    {"name": "Science Block B", "lat": 12.9712, "lng": 77.5940},
    {"name": "Engineering Quad", "lat": 12.9725, "lng": 77.5955},
    {"name": "Student Activity Center", "lat": 12.9718, "lng": 77.5960},
    {"name": "Sports Complex", "lat": 12.9730, "lng": 77.5965},
    {"name": "Hostel Block 4", "lat": 12.9705, "lng": 77.5935},
]

async def seed():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        from sqlalchemy import select
        res = await session.execute(select(Category))
        existing_cat = res.scalars().first()
        if existing_cat:
            print("Database already contains data, updating...")

        # 1. Users
        res = await session.execute(select(User).where(User.email == "student@college.edu"))
        u1 = res.scalars().first()
        if not u1:
            u1 = User(
                name="Alex Student",
                email="student@college.edu",
                department="Computer Science",
                year="Senior",
                karma=150,
            )
            session.add(u1)

        res = await session.execute(select(User).where(User.email == "jordan@college.edu"))
        u2 = res.scalars().first()
        if not u2:
            u2 = User(
                name="Jordan Lee",
                email="jordan@college.edu",
                department="Mechanical Eng.",
                year="Junior",
                karma=80,
            )
            session.add(u2)

        await session.commit()
        await session.refresh(u1)
        await session.refresh(u2)

        # 2. Categories
        cat_map = {}
        for c in CATEGORIES:
            res = await session.execute(select(Category).where(Category.name == c["name"]))
            cat = res.scalars().first()
            if not cat:
                cat = Category(name=c["name"], icon=c["icon"])
                session.add(cat)
                await session.flush()
            cat_map[c["name"]] = cat.id

        # 3. Zones
        zone_map = {}
        for z in ZONES:
            res = await session.execute(select(Zone).where(Zone.name == z["name"]))
            zone = res.scalars().first()
            if not zone:
                zone = Zone(name=z["name"], lat=z["lat"], lng=z["lng"])
                session.add(zone)
                await session.flush()
            zone_map[z["name"]] = zone.id

        await session.commit()

        # 4. Sample Items
        res = await session.execute(select(Item))
        existing_items = res.scalars().all()
        if len(existing_items) < 3:
            now = datetime.now(timezone.utc)
            items_data = [
                {
                    "title": "AirPods Pro (2nd Gen) in White Case",
                    "type": ItemType.lost,
                    "description": "Left my AirPods Pro inside the quiet study room on the 2nd floor of the library. Case has a small scratch on the back hinge.",
                    "category_id": cat_map["Electronics"],
                    "zone_id": zone_map["Central Library"],
                    "color": "White",
                    "brand": "Apple",
                    "custody_location": "Lost near Desk #14",
                    "reward_note": "$20 campus cafeteria voucher for finder!",
                    "status": ItemStatus.lost,
                    "image_public_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
                    "user_id": u1.id,
                    "created_at": now - timedelta(hours=3),
                },
                {
                    "title": "Student ID Card & Dorm Keycard",
                    "type": ItemType.found,
                    "description": "Found a blue lanyard with student ID card for John M. and hostel key fob near Table 6 in the main cafeteria.",
                    "category_id": cat_map["IDs & Cards"],
                    "zone_id": zone_map["Main Cafeteria"],
                    "color": "Blue / White",
                    "brand": "Campus ID",
                    "custody_location": "Deposited at Cafeteria Helpdesk Counter",
                    "reward_note": None,
                    "status": ItemStatus.found,
                    "image_public_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
                    "user_id": u2.id,
                    "created_at": now - timedelta(hours=5),
                },
                {
                    "title": "Matte Black Hydroflask Water Bottle 32oz",
                    "type": ItemType.lost,
                    "description": "Left my Hydroflask beside the treadmill in the indoor gym. Covered in coding & national park stickers (including a GitHub Octocat sticker).",
                    "category_id": cat_map["Other"],
                    "zone_id": zone_map["Sports Complex"],
                    "color": "Black",
                    "brand": "Hydro Flask",
                    "custody_location": "Gym 1st Floor",
                    "reward_note": "A free boba tea!",
                    "status": ItemStatus.lost,
                    "image_public_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
                    "user_id": u1.id,
                    "created_at": now - timedelta(days=1),
                },
                {
                    "title": "Navy Blue Herschel Backpack",
                    "type": ItemType.found,
                    "description": "Found on the front benches of Engineering Quad during lunch break. Contains notebook, pen pouch, and graphing calculator.",
                    "category_id": cat_map["Bags & Backpacks"],
                    "zone_id": zone_map["Engineering Quad"],
                    "color": "Navy Blue",
                    "brand": "Herschel",
                    "custody_location": "Engineering Department Dean's Office",
                    "reward_note": None,
                    "status": ItemStatus.found,
                    "image_public_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
                    "user_id": u2.id,
                    "created_at": now - timedelta(days=1, hours=4),
                },
                {
                    "title": "Set of Car & Dorm Keys with Red Lanyard",
                    "type": ItemType.found,
                    "description": "Honda car key fob with 3 brass keys and a red lanyard found on the staircase of Science Block B.",
                    "category_id": cat_map["Keys & Accessories"],
                    "zone_id": zone_map["Science Block B"],
                    "color": "Red & Silver",
                    "brand": "Honda",
                    "custody_location": "Science Block Security Guard Room",
                    "reward_note": None,
                    "status": ItemStatus.found,
                    "image_public_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80",
                    "user_id": u2.id,
                    "created_at": now - timedelta(days=2),
                },
                {
                    "title": "Grey Patagonia Fleece Jacket (Medium)",
                    "type": ItemType.lost,
                    "description": "Accidentally left on the chair back in Student Activity Center Meeting Room 204 after club rehearsal.",
                    "category_id": cat_map["Clothing & Apparel"],
                    "zone_id": zone_map["Student Activity Center"],
                    "color": "Grey",
                    "brand": "Patagonia",
                    "custody_location": "SAC Room 204",
                    "reward_note": None,
                    "status": ItemStatus.lost,
                    "image_public_url": "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80",
                    "user_id": u1.id,
                    "created_at": now - timedelta(days=3),
                },
            ]

            for item_info in items_data:
                item = Item(**item_info)
                session.add(item)
            await session.commit()
            print("Successfully seeded initial items!")

            # Add a sample claim
            res = await session.execute(select(Item).where(Item.title.ilike("%Herschel%")))
            bag_item = res.scalars().first()
            if bag_item:
                claim = Claim(
                    item_id=bag_item.id,
                    claimant_id=u1.id,
                    answers_json={
                        "proof_description": "My initials 'AS' are written on the inside label of the front pocket. It has a TI-84 calculator inside.",
                        "contact_info": "alex.student@college.edu / (555) 234-5678",
                    },
                    status=ClaimStatus.pending,
                )
                session.add(claim)
                await session.commit()
                print("Seeded sample claim on Herschel backpack!")

    print("Seed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
