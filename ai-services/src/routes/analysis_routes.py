"""
Campaign & Competitor Analysis API Routes — تحليل الحملات والمنافسين
"""
from __future__ import annotations

import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.agents.campaign_analyzer import CampaignAnalyzerAgent
from src.agents.competitor_analyzer import CompetitorAnalyzerAgent
from src.middleware.auth import get_current_user
from src.schemas.analysis import (
    CampaignAnalysisRequest,
    CampaignAnalysisResponse,
    CompetitorAnalysisRequest,
    CompetitorAnalysisResponse,
    CompetitorComparisonRequest,
    CompetitorComparisonResponse,
    PerformancePredictionRequest,
    PerformancePredictionResponse,
)
from src.utils.response_formatter import build_api_response

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])
limiter = Limiter(key_func=get_remote_address)

campaign_agent = CampaignAnalyzerAgent()
competitor_agent = CompetitorAnalyzerAgent()


@router.post("/analyze-campaign", response_model=dict)
@limiter.limit("20/minute")
async def analyze_campaign(
    request: Request,
    body: CampaignAnalysisRequest,
    user: dict = Depends(get_current_user),
):
    """
    تحليل أداء الحملة الإعلانية.

    Comprehensive campaign performance analysis with benchmarks and recommendations.
    يقارن أداءك بمعايير الصناعة ويقدم توصيات قابلة للتنفيذ.
    """
    start_time = time.time()
    try:
        result = await campaign_agent.analyze_campaign(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"analyze_campaign failed: {e}")
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/predict-performance", response_model=dict)
@limiter.limit("20/minute")
async def predict_performance(
    request: Request,
    body: PerformancePredictionRequest,
    user: dict = Depends(get_current_user),
):
    """
    توقع أداء الحملة قبل إطلاقها.

    Predict campaign performance based on budget, platform, and targeting.
    يساعد في تخطيط الميزانية وتحديد التوقعات الواقعية.
    """
    start_time = time.time()
    try:
        result = await campaign_agent.predict_performance(body)
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


@router.post("/analyze-competitor", response_model=dict)
@limiter.limit("20/minute")
async def analyze_competitor(
    request: Request,
    body: CompetitorAnalysisRequest,
    user: dict = Depends(get_current_user),
):
    """
    تحليل منافس فردي.

    Analyze a competitor's strategy, strengths, and weaknesses.
    يقدم توصيات للتفوق على المنافس.
    """
    start_time = time.time()
    try:
        result = await competitor_agent.analyze_competitor(body)
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=result.model_dump(),
            processing_time_ms=elapsed,
        )
    except Exception as e:
        logger.error(f"analyze_competitor failed: {e}")
        elapsed = (time.time() - start_time) * 1000
        return build_api_response(
            data=None,
            processing_time_ms=elapsed,
            error=str(e),
        )


@router.post("/competitor-comparison", response_model=dict)
@limiter.limit("10/minute")
async def competitor_comparison(
    request: Request,
    body: CompetitorComparisonRequest,
    user: dict = Depends(get_current_user),
):
    """
    مقارنة بين منافسين متعددين.

    Compare multiple competitors side-by-side with a comparison matrix.
    يحدد موقعك التنافسي وفرص المحيط الأزرق.
    """
    start_time = time.time()
    try:
        result = await competitor_agent.compare_competitors(body)
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
