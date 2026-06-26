"""
Campaign Analysis & Competitor Analysis Schemas
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from .common import Effort, Platform, Priority, UserContext


# ──────────────────────────────────────────
# Campaign Analysis
# ──────────────────────────────────────────
class CampaignData(BaseModel):
    impressions: int
    clicks: int
    conversions: int
    spend: float
    revenue: float
    ctr: Optional[float] = None
    cpc: Optional[float] = None
    cpm: Optional[float] = None
    cpa: Optional[float] = None
    roas: Optional[float] = None
    start_date: str
    end_date: str
    platform: Platform
    objective: str
    industry_averages: Optional[Dict[str, float]] = None


class CampaignAnalysisRequest(BaseModel):
    campaign_data: CampaignData
    country: str = Field(..., description="الدولة المستهدفة")
    product_category: str
    user_context: Optional[UserContext] = None


class BenchmarkComparison(BaseModel):
    ctr_benchmark: float
    cpc_benchmark: float
    cpa_benchmark: float
    your_ctr: float
    your_cpc: float
    your_cpa: float


class OptimizationOpportunity(BaseModel):
    area: str
    current_value: str
    target_value: str
    estimated_improvement: str


class Recommendation(BaseModel):
    priority: Priority
    action: str
    expected_impact: str
    effort: Effort


class CampaignAnalysisResponse(BaseModel):
    overall_score: float = Field(..., ge=1, le=10, description="تقييم عام من 1-10")
    summary: str = Field(..., description="ملخص التحليل بالعربية")
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[Recommendation]
    benchmarks_comparison: BenchmarkComparison
    optimization_opportunities: List[OptimizationOpportunity]


# ──────────────────────────────────────────
# Performance Prediction
# ──────────────────────────────────────────
class PerformancePredictionRequest(BaseModel):
    budget: float
    platform: Platform
    objective: str
    target_country: str
    target_age_range: Optional[str] = None
    target_gender: Optional[str] = None
    industry: str
    season: Optional[str] = None
    user_context: Optional[UserContext] = None


class PerformancePredictionResponse(BaseModel):
    predicted_impressions: int
    predicted_clicks: int
    predicted_conversions: float
    predicted_cost_per_result: float
    confidence_score: float = Field(..., ge=0, le=1)
    range: Dict[str, Any] = Field(..., description="التوقعات الدنيا والقصوى")
    rationale: str


# ──────────────────────────────────────────
# Competitor Analysis
# ──────────────────────────────────────────
class CompetitorAnalysisRequest(BaseModel):
    competitor_name: str
    platform: Platform
    country: str
    product_category: str
    known_ads: Optional[List[Dict[str, Any]]] = None
    user_context: Optional[UserContext] = None


class CompetitiveProfile(BaseModel):
    estimated_monthly_spend: str
    primary_platforms: List[str]
    ad_strategy: str
    messaging_style: str
    visual_style: str


class CompetitorAnalysisResponse(BaseModel):
    competitive_profile: CompetitiveProfile
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]
    recommendations: List[Dict[str, Any]]


# ──────────────────────────────────────────
# Competitor Comparison
# ──────────────────────────────────────────
class CompetitorInfo(BaseModel):
    name: str
    platform: Platform
    estimated_spend: Optional[float] = None
    active_ads_count: Optional[int] = None
    top_headlines: Optional[List[str]] = None
    visual_style: Optional[str] = None


class CompetitorComparisonRequest(BaseModel):
    competitors: List[CompetitorInfo]
    user_context: Optional[UserContext] = None


class ComparisonMatrixItem(BaseModel):
    name: str
    market_share: int = Field(..., ge=1, le=10)
    innovation: int = Field(..., ge=1, le=10)
    pricing: int = Field(..., ge=1, le=10)
    messaging: int = Field(..., ge=1, le=10)
    visual: int = Field(..., ge=1, le=10)


class CompetitorComparisonResponse(BaseModel):
    comparison_matrix: List[ComparisonMatrixItem]
    market_position: str
    blue_ocean_opportunities: List[str]
    recommended_strategy: str
