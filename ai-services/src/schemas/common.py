"""
Common Pydantic schemas shared across all AI services.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Platform(str, Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    SNAPCHAT = "snapchat"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    GOOGLE = "google"


class Tone(str, Enum):
    PROFESSIONAL = "professional"
    FUNNY = "funny"
    URGENT = "urgent"
    LUXURY = "luxury"
    FRIENDLY = "friendly"
    FORMAL = "formal"
    CASUAL = "casual"
    INSPIRATIONAL = "inspirational"


class Language(str, Enum):
    ARABIC = "ar"
    ENGLISH = "en"
    BOTH = "both"


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Effort(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Objective(str, Enum):
    AWARENESS = "awareness"
    TRAFFIC = "traffic"
    ENGAGEMENT = "engagement"
    LEADS = "leads"
    SALES = "sales"
    APP_INSTALLS = "app_installs"


class UserContext(BaseModel):
    """User context for personalized recommendations."""
    user_id: str
    business_name: Optional[str] = None
    industry: Optional[str] = None
    primary_platforms: Optional[List[Platform]] = None
    monthly_budget_range: Optional[str] = None
    experience_level: Optional[str] = Field(None, description="beginner/intermediate/expert")


class APIResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool = True
    data: Optional[Any] = None
    error: Optional[str] = None
    processing_time_ms: Optional[float] = None
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
