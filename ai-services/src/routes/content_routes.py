"""
Content Generation API Routes — توليد المحتوى
"""
from __future__ import annotations

import logging
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.agents.content_generator import ContentGeneratorAgent
from src.middleware.auth import get_current_user
from src.schemas.content import (
    AdTextRequest,
    AdTextResponse,
    HashtagRequest,
    HashtagResponse,
    ImagePromptRequest,
    ImagePromptResponse,
    VideoScriptRequest,
    VideoScriptResponse,
)
from src.utils.response_formatter import build_api_response

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])
limiter = Limiter(key_func=get_remote_address)

agent = ContentGeneratorAgent()


@router.post("/generate-ad-text", response_model=dict)
@limiter.limit("30/minute")
async def generate_ad_text(
    request: Request,
    body: AdTextRequest,
    user: dict = Depends(get_current_user),
):
    """
    توليد نصوص إعلانية مقنعة.

    Generate compelling ad copy for social media platforms.
    يدعم العربية والإنجليزية مع التحكم في النبرة والمنصة.
    """
    start_time = time.time()
    try:
        result = await agent.generate_ad_text(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"generate_ad_text failed: {e}")
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/generate-image-prompt", response_model=dict)
@limiter.limit("30/minute")
async def generate_image_prompt(
    request: Request,
    body: ImagePromptRequest,
    user: dict = Depends(get_current_user),
):
    """
    توليد أوصاف الصور الإعلانية.

    Generate detailed image prompts for ad creatives.
    يدعم أنماط متعددة: minimalist, luxury, funny, professional.
    """
    start_time = time.time()
    try:
        result = await agent.generate_image_prompt(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/generate-video-script", response_model=dict)
@limiter.limit("20/minute")
async def generate_video_script(
    request: Request,
    body: VideoScriptRequest,
    user: dict = Depends(get_current_user),
):
    """
    توليد سكريبتات فيديو إعلانية.

    Generate video ad scripts with hooks, body, and CTAs.
    يدوم الفيديو من 15 إلى 60 ثانية.
    """
    start_time = time.time()
    try:
        result = await agent.generate_video_script(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/generate-hashtags", response_model=dict)
@limiter.limit("30/minute")
async def generate_hashtags(
    request: Request,
    body: HashtagRequest,
    user: dict = Depends(get_current_user),
):
    """
    توليد هاشتاجات للحملات الإعلانية.

    Generate relevant hashtags organized by category.
    من 5 إلى 20 هاشتاج حسب الطلب.
    """
    start_time = time.time()
    try:
        result = await agent.generate_hashtags(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )
