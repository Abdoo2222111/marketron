"""
Content Generation Schemas
"""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field

from .common import Language, Platform, Tone, UserContext


# ──────────────────────────────────────────
# Ad Text Generation
# ──────────────────────────────────────────
class AdTextRequest(BaseModel):
    product_name: str = Field(..., description="اسم المنتج", min_length=1)
    product_description: str = Field(..., description="وصف المنتج", min_length=1)
    platform: Platform
    tone: Tone = Tone.PROFESSIONAL
    target_audience: Optional[str] = Field(None, description="الجمهور المستهدف")
    language: Language = Language.ARABIC
    count: int = Field(default=3, ge=1, le=10, description="عدد النصوص المطلوبة")
    user_context: Optional[UserContext] = None


class AdTextItem(BaseModel):
    headline: str = Field(..., description="العنوان الرئيسي")
    primary_text: str = Field(..., description="النص الأساسي")
    cta: str = Field(..., description="دعوة لاتخاذ إجراء")
    hashtags: List[str] = Field(default_factory=list, description="الهاشتاجات")


class AdTextResponse(BaseModel):
    texts: List[AdTextItem]
    rationale: Optional[str] = Field(None, description="شرح سبب اختيار هذه النصوص")


# ──────────────────────────────────────────
# Image Prompt Generation
# ──────────────────────────────────────────
class ImagePromptRequest(BaseModel):
    product_name: str
    product_category: str
    style: str = Field(default="professional", description="minimalist/luxury/funny/professional")
    platform: Platform
    user_context: Optional[UserContext] = None


class ImagePromptItem(BaseModel):
    title: str
    description: str
    prompt_ar: str = Field(..., description="وصف الصورة بالعربية")
    prompt_en: str = Field(..., description="وصف الصورة بالإنجليزية")
    style_notes: str


class ImagePromptResponse(BaseModel):
    prompts: List[ImagePromptItem]


# ──────────────────────────────────────────
# Video Script Generation
# ──────────────────────────────────────────
class VideoScriptRequest(BaseModel):
    product_name: str
    duration_seconds: int = Field(default=30, ge=15, le=60)
    platform: Platform
    tone: Tone = Tone.PROFESSIONAL
    user_context: Optional[UserContext] = None


class VideoScriptItem(BaseModel):
    hook: str = Field(..., description="الخطاف - بداية الفيديو")
    body: str = Field(..., description="جسم الفيديو")
    call_to_action: str = Field(..., description="دعوة لاتخاذ إجراء")
    visual_notes: str = Field(..., description="ملاحظات بصرية للمونتاج")
    duration_seconds: int


class VideoScriptResponse(BaseModel):
    scripts: List[VideoScriptItem]


# ──────────────────────────────────────────
# Hashtag Generation
# ──────────────────────────────────────────
class HashtagRequest(BaseModel):
    product_name: str
    product_category: str
    platform: Platform
    count: int = Field(default=10, ge=5, le=20)
    user_context: Optional[UserContext] = None


class HashtagResponse(BaseModel):
    hashtags: List[str]
    categories: Optional[dict] = Field(None, description="تصنيف الهاشتاجات حسب النوع")
