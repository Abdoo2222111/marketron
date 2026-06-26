"""
Arabic NLP API Routes — معالجة اللغة العربية
"""
from __future__ import annotations

import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.agents.arabic_nlp import ArabicNLPAgent
from src.middleware.auth import get_current_user
from src.schemas.market import (
    ExtractKeywordsRequest,
    ExtractKeywordsResponse,
    GenerateSEOContentRequest,
    GenerateSEOContentResponse,
    SentimentAnalysisRequest,
    SentimentAnalysisResponse,
)
from src.utils.response_formatter import build_api_response

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])
limiter = Limiter(key_func=get_remote_address)

agent = ArabicNLPAgent()


@router.post("/sentiment-analysis", response_model=dict)
@limiter.limit("30/minute")
async def sentiment_analysis(
    request: Request,
    body: SentimentAnalysisRequest,
    user: dict = Depends(get_current_user),
):
    """
    تحليل المشاعر في النصوص العربية.

    Analyze sentiment in Arabic text (supports both classical Arabic and dialects).
    يدعم العربية الفصحى واللهجات (خليجي، مصري، شامي).
    """
    start_time = time.time()
    try:
        result = await agent.analyze_sentiment(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"sentiment_analysis failed: {e}")
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/extract-keywords", response_model=dict)
@limiter.limit("30/minute")
async def extract_keywords(
    request: Request,
    body: ExtractKeywordsRequest,
    user: dict = Depends(get_current_user),
):
    """
    استخراج كلمات مفتاحية من النصوص العربية.

    Extract keywords from Arabic text with relevance weights.
    يستخرج الكلمات الأكثر أهمية مع وزن لكل كلمة.
    """
    start_time = time.time()
    try:
        result = await agent.extract_keywords(body)
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


@router.post("/generate-seo-content", response_model=dict)
@limiter.limit("10/minute")
async def generate_seo_content(
    request: Request,
    body: GenerateSEOContentRequest,
    user: dict = Depends(get_current_user),
):
    """
    توليد محتوى SEO بالعربية.

    Generate SEO-optimized Arabic content with meta descriptions and proper structure.
    يشمل العنوان، الوصف، المحتوى، وتقييم تحسين محركات البحث.
    """
    start_time = time.time()
    try:
        result = await agent.generate_seo_content(body)
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
