from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from app.models import ItemType, ItemStatus, ClaimStatus

# --- User ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None
    year: Optional[str] = None
    role: str = "student"
    karma: int = 0
    is_banned: bool = False

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Category ---
class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# --- Zone ---
class ZoneBase(BaseModel):
    name: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class ZoneCreate(ZoneBase):
    pass

class ZoneResponse(ZoneBase):
    id: int
    class Config:
        from_attributes = True

# --- Claim ---
class ClaimCreate(BaseModel):
    proof_description: str
    contact_info: Optional[str] = None
    answers_json: Optional[Any] = None

class ClaimStatusUpdate(BaseModel):
    status: ClaimStatus

class ClaimResponse(BaseModel):
    id: int
    item_id: int
    claimant_id: int
    answers_json: Optional[Any] = None
    ai_confidence: Optional[str] = None
    status: ClaimStatus
    reviewed_by: Optional[int] = None
    created_at: datetime
    claimant: Optional[UserResponse] = None
    class Config:
        from_attributes = True

# --- Item ---
class ItemBase(BaseModel):
    type: ItemType
    title: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    zone_id: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    event_time: Optional[datetime] = None
    custody_location: Optional[str] = None
    reward_note: Optional[str] = None
    image_public_url: Optional[str] = None
    image_original_url: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemStatusUpdate(BaseModel):
    status: ItemStatus

class ItemResponse(ItemBase):
    id: int
    user_id: int
    status: ItemStatus
    expires_at: Optional[datetime] = None
    created_at: datetime
    user: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None
    zone: Optional[ZoneResponse] = None

    class Config:
        from_attributes = True

class ItemDetailResponse(ItemResponse):
    claims: Optional[List[ClaimResponse]] = []

# --- User Profile ---
class UserProfileResponse(UserResponse):
    items: List[ItemResponse] = []
    claims: List[ClaimResponse] = []
