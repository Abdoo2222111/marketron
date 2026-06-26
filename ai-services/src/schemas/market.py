"""
Market Research & Recommendation Schemas
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from .common import Effort, Platform, UserContext


# ──────────────────────────────────────────
# Market Analysis
# ──────────────────────────────────────────
class MarketAnalysisRequest(BaseModel):
    product_name: str
    product_category: str
    target_country: str = Field(..., description="مثل 'السعودية' أو 'UAE'")
    target_audience: Optional[str] = None
    user_context: Optional[UserContext] = None


class MarketSize(BaseModel):
    total_addressable: str
    serviceable: str
    obtainable: str
    currency: str = "SAR"
    source: str


class MarketTrend(BaseModel):
    trend: str
    description: str
    impact: str  # positive/negative
    data_points: List[str]


class Seasonality(BaseModel):
    month: int = Field(..., ge=1, le=12)
    demand_level: int = Field(..., ge=1, le=10)
    notes: str


class CompetitorLandscape(BaseModel):
    name: str
    market_share_estimate: str
    strengths: List[str]
    weaknesses: List[str]
    price_range: str


class PricingAnalysis(BaseModel):
    avg_price: float
    price_range: str
    recommended_price: float
    reasoning: str


class CustomerInsights(BaseModel):
    demographics: List[str]
    psychographics: List[str]
    pain_points: List[str]
    desires: List[str]
    buying_factors: List[str]


class SWOT(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]


class EntryStrategy(BaseModel):
    recommended_channels: List[str]
    budget_range: str
    timeline: str
    key_metrics: List[str]
    risks: List[str]


class MarketAnalysisResponse(BaseModel):
    market_size: MarketSize
    market_trends: List[MarketTrend]
    seasonality: List[Seasonality]
    competitor_landscape: List[CompetitorLandscape]
    pricing_analysis: PricingAnalysis
    customer_insights: CustomerInsights
    swot: SWOT
    entry_strategy: EntryStrategy


# ──────────────────────────────────────────
# Why Not Selling Analysis
# ──────────────────────────────────────────
class SalesData(BaseModel):
    impressions: int
    clicks: int
    conversions: int
    conversion_rate: float
    competitor_prices: Optional[List[float]] = None
    customer_feedback: Optional[List[str]] = None


class WhyNotSellingRequest(BaseModel):
    product_name: str
    product_category: str
    target_country: str
    price: float
    current_campaigns: Optional[List[Dict[str, Any]]] = None
    sales_data: SalesData
    user_context: Optional[UserContext] = None


class RootCause(BaseModel):
    cause: str
    impact_level: str = Field(..., description="high/medium/low")
    explanation: str


class QuickWin(BaseModel):
    action: str
    expected_impact: str
    effort: Effort
    time_to_result: str


class StrategicRecommendation(BaseModel):
    area: str
    action: str
    timeline: str
    expected_outcome: str


class PricingFeedback(BaseModel):
    current_position: str
    recommendation: str
    justification: str


class TargetingFeedback(BaseModel):
    current: str
    recommended: str
    reasoning: str


class MessagingFeedback(BaseModel):
    current_approach: str
    recommended_approach: str


class ExampleAd(BaseModel):
    headline: str
    primary_text: str
    cta: str
    rationale: str


class WhyNotSellingResponse(BaseModel):
    problem_identification: Dict[str, Any]
    root_causes: List[RootCause]
    quick_wins: List[QuickWin]
    strategic_recommendations: List[StrategicRecommendation]
    pricing_feedback: PricingFeedback
    targeting_feedback: TargetingFeedback
    messaging_feedback: MessagingFeedback
    example_ad: ExampleAd


# ──────────────────────────────────────────
# Budget Recommendation
# ──────────────────────────────────────────
class PlatformAllocation(BaseModel):
    name: str
    current_allocation: Optional[float] = None
    performance_score: Optional[float] = Field(None, ge=0, le=10)


class BudgetRecommendationRequest(BaseModel):
    total_budget: float
    platforms: List[PlatformAllocation]
    objectives: List[str]
    target_country: str
    user_context: Optional[UserContext] = None


class RecommendedAllocation(BaseModel):
    platform: str
    percentage: float
    amount: float
    rationale: str


class ExpectedImpact(BaseModel):
    total_reach: str
    total_clicks: str
    total_conversions: str


class BudgetRecommendationResponse(BaseModel):
    recommended_allocation: List[RecommendedAllocation]
    expected_impact: ExpectedImpact
    strategy_rationale: str


# ──────────────────────────────────────────
# Targeting Recommendation
# ──────────────────────────────────────────
class TargetingRecommendationRequest(BaseModel):
    product: str
    country: str
    current_targeting: Dict[str, Any]
    campaign_performance_data: Optional[Dict[str, Any]] = None
    user_context: Optional[UserContext] = None


class TargetingRecommendationResponse(BaseModel):
    recommended: Dict[str, Any]
    rationale: str


# ──────────────────────────────────────────
# Timing Recommendation
# ──────────────────────────────────────────
class TimingRecommendationRequest(BaseModel):
    platform: Platform
    target_country: str
    target_audience: Optional[str] = None
    industry: str
    user_context: Optional[UserContext] = None


class HourScore(BaseModel):
    hour: int = Field(..., ge=0, le=23)
    score: float = Field(..., ge=0, le=10)


class TimingRecommendationResponse(BaseModel):
    best_days: List[str]
    best_hours: List[HourScore]
    timezone: str
    recommendations: List[str]


# ──────────────────────────────────────────
# Arabic NLP
# ──────────────────────────────────────────
class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = "ar"


class SentimentAnalysisResponse(BaseModel):
    sentiment: str  # positive/negative/neutral/mixed
    score: float = Field(..., ge=-1, le=1)
    aspects: Optional[List[Dict[str, Any]]] = None
    emotion: Optional[str] = None


class ExtractKeywordsRequest(BaseModel):
    text: str = Field(..., min_length=1)
    max_keywords: int = Field(default=10, ge=1, le=50)
    language: str = "ar"


class ExtractKeywordsResponse(BaseModel):
    keywords: List[str]
    keyword_weights: Optional[Dict[str, float]] = None


class GenerateSEOContentRequest(BaseModel):
    topic: str
    target_keywords: List[str]
    language: str = "ar"
    word_count: int = Field(default=500, ge=200, le=3000)


class GenerateSEOContentResponse(BaseModel):
    title: str
    meta_description: str
    content: str
    keywords_used: List[str]
    seo_score: float = Field(..., ge=0, le=100)
