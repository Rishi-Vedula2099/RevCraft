"""
# RevCraft — SQLAlchemy ORM Models
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


def utcnow():
    return datetime.now(timezone.utc)


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    builds: Mapped[list["CarBuild"]] = relationship("CarBuild", back_populates="owner", cascade="all, delete-orphan")


class CarBuild(Base):
    __tablename__ = "car_builds"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, default="Untitled Build")

    # Car configuration stored as JSON
    config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Performance metrics
    horsepower: Mapped[float] = mapped_column(Float, default=0.0)
    torque: Mapped[float] = mapped_column(Float, default=0.0)
    weight: Mapped[float] = mapped_column(Float, default=0.0)
    top_speed: Mapped[float] = mapped_column(Float, default=0.0)
    acceleration: Mapped[float] = mapped_column(Float, default=0.0)
    handling: Mapped[float] = mapped_column(Float, default=0.0)

    # Scoring
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    car_class: Mapped[str] = mapped_column(String(1), default="D")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="builds")
