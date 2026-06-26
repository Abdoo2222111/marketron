"""
Recommendation Engine API Routes — محرك التوصيات
"""
from __future__ import annotations

import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.agents.recommendation_engine import RecommendationEngine
from src.middleware.auth import get_current_user
from src.schemas.market import (
    BudgetRecommendationRequest,
    BudgetRecommendationResponse,
    TargetingRecommendationRequest,
    TargetingRecommendationResponse,
    TimingRecommendationRequest,
    TimingRecommendationResponse,
)
from src.utils.response_formatter import build_api_response

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])
limiter = Limiter(key_func=get_remote_address)

agent = RecommendationEngine()


@router.post("/recommend-budget", response_model=dict)
@limiter.limit("20/minute")
async def recommend_budget(
    request: Request,
    body: BudgetRecommendationRequest,
    user: dict = Depends(get_current_user),
):
    """
    توصية بتوزيع الميزانية الإعلانية.

    Get optimal budget allocation recommendations across platforms.
    يحلل أداء كل منصة ويوزع الميزانية لتحقيق أقصى عائد.
    """
    start_time = time.time()
    try:
        result = await agent.recommend_budget(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"recommend_budget failed: {e}")
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/recommend-targeting", response_model=dict)
@limiter.limit("20/minute")
async def recommend_targeting(
    request: Request,
    body: TargetingRecommendationRequest,
    user: dict = Depends(get_current_user),
):
    """
    توصيات لتحسين استهداف الجمهور.

    Get audience targeting recommendations based on product and market.
    يشمل الفئة العمرية، الاهتمامات، المواقع، واقتراحات Lookalike.
    """
    start_time = time.time()
    try:
        result = await agent.recommend_targeting(body)
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


@router.post("/recommend-timing", response_model=dict)
@limiter.limit("20/minute")
async def recommend_timing(
    request: Request,
    body: TimingRecommendationRequest,
    user: dict = Depends(get_current_user),
):
    """
    أفضل أوقات النشر للحملات الإعلانية.

    Get the best times to post ads on each platform.
    يعتمد على المنصة، الدولة، المجال، والجمهور المستهدف.
    """
    start_time = time.time()
    try:
        result = await agent.recommend_timing(body)
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
