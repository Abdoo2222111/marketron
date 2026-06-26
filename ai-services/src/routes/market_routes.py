"""
Market Research API Routes — أبحاث السوق
"""
from __future__ import annotations

import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.agents.market_researcher import MarketResearcherAgent
from src.middleware.auth import get_current_user
from src.schemas.market import (
    MarketAnalysisRequest,
    MarketAnalysisResponse,
    WhyNotSellingRequest,
    WhyNotSellingResponse,
)
from src.utils.response_formatter import build_api_response

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])
limiter = Limiter(key_func=get_remote_address)

agent = MarketResearcherAgent()


@router.post("/market-analysis", response_model=dict)
@limiter.limit("10/minute")
async def market_analysis(
    request: Request,
    body: MarketAnalysisRequest,
    user: dict = Depends(get_current_user),
):
    """
    تحليل سوق شامل لمنتج في دولة مستهدفة.

    Comprehensive market analysis for any product in any target country.
    يشمل حجم السوق، الاتجاهات، الموسمية، المشهد التنافسي، التسعير،
    رؤى العملاء، تحليل SWOT، واستراتيجية الدخول.
    """
    start_time = time.time()
    try:
        result = await agent.analyze_market(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"market_analysis failed: {e}")
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/why-not-selling", response_model=dict)
@limiter.limit("10/minute")
async def why_not_selling(
    request: Request,
    body: WhyNotSellingRequest,
    user: dict = Depends(get_current_user),
):
    """
    تشخيص "ليه مش ببيع؟" - تحليل أسباب ضعف المبيعات.

    Diagnose why a product isn't selling well. Analyzes pricing, targeting,
    messaging, and provides quick wins and strategic recommendations.
    """
    start_time = time.time()
    try:
        result = await agent.analyze_why_not_selling(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"why_not_selling failed: {e}")
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )
