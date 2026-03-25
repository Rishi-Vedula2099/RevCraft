"""
AutoForge AI — Pydantic Schemas
Request/Response validation models.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


# ─── Car Configuration ───────────────────────────────────────────────

class CarConfig(BaseModel):
    body_type: str = Field(default="sedan", description="sedan | coupe | suv | truck | sports")
    color: str = Field(default="#e63946", description="Hex color code")
    engine: str = Field(default="v6_standard", description="Engine type")
    wheels: str = Field(default="sport_18", description="Wheel type")
    spoiler: str = Field(default="none", description="Spoiler type")
    suspension: str = Field(default="standard", description="Suspension type")
    brakes: str = Field(default="standard", description="Brake type")
    turbo: bool = Field(default=False, description="Turbo enabled")
    weight_reduction: str = Field(default="none", description="Weight reduction level")
    exhaust: str = Field(default="standard", description="Exhaust type")
    transmission: str = Field(default="automatic", description="Transmission type")
    aero_kit: str = Field(default="none", description="Aero kit")


# ─── Performance Stats ───────────────────────────────────────────────

class PerformanceStats(BaseModel):
    horsepower: float
    torque: float
    weight: float
    top_speed: float
    acceleration: float
    handling: float
    score: float
    car_class: str


# ─── Auth ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Builds ──────────────────────────────────────────────────────────

class BuildCreate(BaseModel):
    name: str = Field(default="Untitled Build", max_length=100)
    config: CarConfig = Field(default_factory=CarConfig)


class BuildUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100)
    config: Optional[CarConfig] = None


class BuildResponse(BaseModel):
    id: str
    user_id: str
    name: str
    config: dict
    horsepower: float
    torque: float
    weight: float
    top_speed: float
    acceleration: float
    handling: float
    performance_score: float
    car_class: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── AI Insights ──────────────────────────────────────────────────────

class AiInsightsRequest(BaseModel):
    config: CarConfig
    stats: PerformanceStats


class AiInsightsResponse(BaseModel):
    performance_analysis: str
    class_explanation: str
    upgrade_suggestions: list[str]


# ─── Analytics ────────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    build_name: str
    performance_score: float
    car_class: str


class ClassDistribution(BaseModel):
    car_class: str
    count: int
    percentage: float


class TrendPoint(BaseModel):
    date: str
    avg_score: float
    build_count: int
