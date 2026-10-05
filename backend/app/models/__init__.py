from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class ItemType(str, enum.Enum):
    lost = "lost"
    found = "found"

class ItemStatus(str, enum.Enum):
    lost = "lost"
    found = "found"
    match_suggested = "match_suggested"
    claim_requested = "claim_requested"
    verified = "verified"
    returned = "returned"
    expired = "expired"
    removed = "removed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(String, nullable=True)
    year = Column(String, nullable=True)
    role = Column(String, default="student")
    karma = Column(Integer, default=0)
    is_banned = Column(Boolean, default=False)
    fcm_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    items = relationship("Item", back_populates="user")
    claims = relationship("Claim", back_populates="claimant", foreign_keys="Claim.claimant_id")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    icon = Column(String, nullable=True)

    items = relationship("Item", back_populates="category")

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    items = relationship("Item", back_populates="zone")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(ItemType))
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    color = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    event_time = Column(DateTime(timezone=True), nullable=True)
    custody_location = Column(String, nullable=True)
    status = Column(Enum(ItemStatus), default=ItemStatus.lost)
    image_public_url = Column(String, nullable=True)
    image_original_url = Column(String, nullable=True)
    # image_embedding VECTOR(512) and text_embedding VECTOR(384) will be added later with pgvector
    reward_note = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="items")
    category = relationship("Category", back_populates="items")
    zone = relationship("Zone", back_populates="items")
    claims = relationship("Claim", back_populates="item")

class ClaimStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    handed_over = "handed_over"

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    claimant_id = Column(Integer, ForeignKey("users.id"))
    answers_json = Column(JSON, nullable=True)
    ai_confidence = Column(String, nullable=True)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.pending)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    item = relationship("Item", back_populates="claims")
    claimant = relationship("User", back_populates="claims", foreign_keys=[claimant_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

