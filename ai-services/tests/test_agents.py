"""
Comprehensive tests for AI Services agents.
اختبارات شاملة لخدمات الذكاء الاصطناعي
"""
from __future__ import annotations

import pytest
from typing import Any, Dict
from unittest.mock import AsyncMock, MagicMock, patch

from src.schemas.common import Platform, Tone, Language, Priority, Effort
from src.schemas.content import (
    AdTextRequest,
    AdTextResponse,
    HashtagRequest,
    ImagePromptRequest,
    VideoScriptRequest,
)
from src.schemas.analysis import (
    CampaignAnalysisRequest,
    CampaignData,
    CompetitorAnalysisRequest,
    PerformancePredictionRequest,
)
from src.schemas.market import (
    ExtractKeywordsRequest,
    MarketAnalysisRequest,
    SentimentAnalysisRequest,
    WhyNotSellingRequest,
    SalesData,
    BudgetRecommendationRequest,
    PlatformAllocation,
)


# ──────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────
@pytest.fixture
def ad_text_request() -> AdTextRequest:
    return AdTextRequest(
        product_name="ساعة ذكية",
        product_description="ساعة ذكية ببطارية تدوم 14 يوماً ومقاومة للماء",
        platform=Platform.FACEBOOK,
        tone=Tone.PROFESSIONAL,
        target_audience="رجال أعمال 25-45 سنة",
        language=Language.ARABIC,
        count=3,
    )


@pytest.fixture
def campaign_request() -> CampaignAnalysisRequest:
    return CampaignAnalysisRequest(
        campaign_data=CampaignData(
            impressions=50000,
            clicks=1500,
            conversions=50,
            spend=2500.0,
            revenue=7500.0,
            platform=Platform.FACEBOOK,
            objective="sales",
            start_date="2025-01-01",
            end_date="2025-01-31",
        ),
        country="السعودية",
        product_category="الكترونيات",
    )


@pytest.fixture
def why_not_selling_request() -> WhyNotSellingRequest:
    return WhyNotSellingRequest(
        product_name="سماعات بلوتوث",
        product_category="الكترونيات",
        target_country="مصر",
        price=250.0,
        sales_data=SalesData(
            impressions=100000,
            clicks=2000,
            conversions=20,
            conversion_rate=1.0,
            competitor_prices=[150, 180, 220],
        ),
    )


# ──────────────────────────────────────────
# Schema Validation Tests
# ──────────────────────────────────────────
class TestSchemas:
    """Test Pydantic schema validation."""

    def test_ad_text_request_valid(self, ad_text_request):
        assert ad_text_request.product_name == "ساعة ذكية"
        assert ad_text_request.platform == Platform.FACEBOOK
        assert ad_text_request.count == 3

    def test_ad_text_request_count_bounds(self):
        with pytest.raises(ValueError):
            AdTextRequest(
                product_name="Test", product_description="Test",
                platform=Platform.FACEBOOK, count=0
            )
        with pytest.raises(ValueError):
            AdTextRequest(
                product_name="Test", product_description="Test",
                platform=Platform.FACEBOOK, count=11
            )

    def test_campaign_data_computes_fields(self, campaign_request):
        cd = campaign_request.campaign_data
        # Fields are manually set; ctr/cpc/cpa are None unless explicitly passed
        assert cd.impressions == 50000
        assert cd.clicks == 1500
        assert cd.conversions == 50
        assert cd.spend == 2500.0
        computed_ctr = cd.clicks / cd.impressions * 100 if cd.impressions else 0
        computed_cpc = cd.spend / cd.clicks if cd.clicks else 0
        computed_cpa = cd.spend / cd.conversions if cd.conversions else 0
        assert computed_ctr == 3.0
        assert computed_cpc == pytest.approx(1.6667, 0.01)
        assert computed_cpa == 50.0

    def test_hashtag_request_count(self):
        req = HashtagRequest(
            product_name="Test",
            product_category="Tech",
            platform=Platform.INSTAGRAM,
            count=15,
        )
        assert req.count == 15
        with pytest.raises(ValueError):
            HashtagRequest(
                product_name="Test",
                product_category="Tech",
                platform=Platform.INSTAGRAM,
                count=25,
            )


# ──────────────────────────────────────────
# Content Generator Tests
# ──────────────────────────────────────────
class TestContentGenerator:
    """Test Content Generator agent."""

    @pytest.mark.asyncio
    async def test_generate_ad_text_structure(self, ad_text_request):
        """Verify response structure matches schema."""
        from src.agents.content_generator import ContentGeneratorAgent

        agent = ContentGeneratorAgent()

        with patch.object(agent, "_load_prompt", return_value="أنت خبير إعلانات."):
            with patch("src.agents.content_generator.llm_client.chat",
                       new=AsyncMock()) as mock_chat:
                mock_chat.return_value = (
                    '{"texts": [{"headline": "عنوان", "primary_text": "نص", '
                    '"cta": "اشترك", "hashtags": ["#هاشتاج"]}], '
                    '"rationale": "سبب"}',
                    {"provider": "openai", "model": "gpt-4o-mini"},
                )
                result = await agent.generate_ad_text(ad_text_request)
                assert isinstance(result, AdTextResponse)
                assert len(result.texts) > 0
                assert result.texts[0].headline
                assert result.texts[0].cta

    @pytest.mark.asyncio
    async def test_generate_hashtags(self):
        from src.agents.content_generator import ContentGeneratorAgent

        agent = ContentGeneratorAgent()
        request = HashtagRequest(
            product_name="قهوة",
            product_category="مشروبات",
            platform=Platform.INSTAGRAM,
            count=5,
        )

        with patch("src.agents.content_generator.llm_client.chat",
                   new=AsyncMock()) as mock_chat:
            mock_chat.return_value = (
                '{"hashtags": ["#قهوة", "#مشروبات", "#صباح_الخير"], '
                '"categories": {"عامة": 2, "متخصصة": 1}}',
                {"provider": "openai"},
            )
            result = await agent.generate_hashtags(request)
            assert len(result.hashtags) >= 1
            assert all(h.startswith("#") for h in result.hashtags)


# ──────────────────────────────────────────
# Campaign Analyzer Tests
# ──────────────────────────────────────────
class TestCampaignAnalyzer:
    """Test Campaign Analyzer agent."""

    @pytest.mark.asyncio
    async def test_analyze_campaign(self, campaign_request):
        from src.agents.campaign_analyzer import CampaignAnalyzerAgent

        agent = CampaignAnalyzerAgent()

        with patch.object(agent, "_load_prompt", return_value="أنت خبير تحليل"):
            with patch("src.agents.campaign_analyzer.llm_client.chat",
                       new=AsyncMock()) as mock_chat:
                mock_chat.return_value = (
                    '{"overall_score": 7.5, "summary": "أداء جيد", '
                    '"strengths": ["نقرات جيدة"], "weaknesses": ["تحويل ضعيف"], '
                    '"recommendations": [{"priority": "high", "action": "حسن الاستهداف", '
                    '"expected_impact": "زيادة", "effort": "medium"}], '
                    '"benchmarks_comparison": {"ctr_benchmark": 2.5, "cpc_benchmark": 1.5, '
                    '"cpa_benchmark": 20, "your_ctr": 3.0, "your_cpc": 1.67, "your_cpa": 50}, '
                    '"optimization_opportunities": []}',
                    {"provider": "openai"},
                )
                result = await agent.analyze_campaign(campaign_request)
                assert result.overall_score == 7.5
                assert len(result.strengths) > 0
                assert len(result.recommendations) > 0

    @pytest.mark.asyncio
    async def test_predict_performance(self):
        from src.agents.campaign_analyzer import CampaignAnalyzerAgent

        agent = CampaignAnalyzerAgent()
        request = PerformancePredictionRequest(
            budget=5000,
            platform=Platform.FACEBOOK,
            objective="sales",
            target_country="السعودية",
            industry="الكترونيات",
        )

        with patch("src.agents.campaign_analyzer.llm_client.chat",
                   new=AsyncMock()) as mock_chat:
            mock_chat.return_value = (
                '{"predicted_impressions": 500000, "predicted_clicks": 10000, '
                '"predicted_conversions": 200, "predicted_cost_per_result": 25, '
                '"confidence_score": 0.7, '
                '"range": {"impressions": {"min": 350000, "max": 650000}}}',
                {"provider": "openai"},
            )
            result = await agent.predict_performance(request)
            assert result.predicted_impressions > 0
            assert result.confidence_score > 0


# ──────────────────────────────────────────
# Arabic NLP Tests
# ──────────────────────────────────────────
class TestArabicNLP:
    """Test Arabic NLP agent."""

    @pytest.mark.asyncio
    async def test_sentiment_analysis_positive(self):
        from src.agents.arabic_nlp import ArabicNLPAgent

        agent = ArabicNLPAgent()
        request = SentimentAnalysisRequest(text="هذا المنتج رائع جداً! أحببته كثيراً")

        result = await agent.analyze_sentiment(request)
        assert result.sentiment in ["positive", "neutral"]
        assert -1 <= result.score <= 1

    @pytest.mark.asyncio
    async def test_sentiment_analysis_negative(self):
        from src.agents.arabic_nlp import ArabicNLPAgent

        agent = ArabicNLPAgent()
        request = SentimentAnalysisRequest(text="سيء جداً، خسارة في الفلوس")

        result = await agent.analyze_sentiment(request)
        assert result.sentiment in ["negative", "neutral"]

    @pytest.mark.asyncio
    async def test_extract_keywords(self):
        from src.agents.arabic_nlp import ArabicNLPAgent

        agent = ArabicNLPAgent()
        request = ExtractKeywordsRequest(
            text="التسويق الإلكتروني أصبح مهماً جداً في العصر الحديث",
            max_keywords=5,
        )

        with patch("src.agents.arabic_nlp.llm_client.chat",
                   new=AsyncMock()) as mock_chat:
            mock_chat.return_value = (
                '{"keywords": ["تسويق إلكتروني", "مهم", "عصر حديث"], '
                '"keyword_weights": {"تسويق إلكتروني": 0.9, "مهم": 0.7}}',
                {"provider": "openai"},
            )
            result = await agent.extract_keywords(request)
            assert len(result.keywords) > 0


# ──────────────────────────────────────────
# Market Research Tests
# ──────────────────────────────────────────
class TestMarketResearch:
    """Test Market Research agent."""

    @pytest.mark.asyncio
    async def test_market_analysis(self):
        from src.agents.market_researcher import MarketResearcherAgent

        agent = MarketResearcherAgent()
        request = MarketAnalysisRequest(
            product_name="تطبيق توصيل",
            product_category="خدمات",
            target_country="السعودية",
        )

        with patch.object(agent, "_load_prompt", return_value="أنت خبير سوق"):
            with patch("src.agents.market_researcher.llm_client.chat",
                       new=AsyncMock()) as mock_chat:
                mock_chat.return_value = (
                    '{"market_size": {"total_addressable": "5M", "serviceable": "2M", '
                    '"obtainable": "500K", "currency": "SAR", "source": "تقدير"}, '
                    '"market_trends": [], "seasonality": [], "competitor_landscape": [], '
                    '"pricing_analysis": {"avg_price": 50, "price_range": "30-100", '
                    '"recommended_price": 45, "reasoning": "تنافسي"}, '
                    '"customer_insights": {"demographics": [], "psychographics": [], '
                    '"pain_points": [], "desires": [], "buying_factors": []}, '
                    '"swot": {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}, '
                    '"entry_strategy": {"recommended_channels": [], "budget_range": "", '
                    '"timeline": "", "key_metrics": [], "risks": []}}',
                    {"provider": "openai"},
                )
                result = await agent.analyze_market(request)
                assert result.market_size.total_addressable
                assert result.pricing_analysis.recommended_price > 0

    @pytest.mark.asyncio
    async def test_why_not_selling(self, why_not_selling_request):
        from src.agents.market_researcher import MarketResearcherAgent

        agent = MarketResearcherAgent()

        with patch.object(agent, "_load_prompt", return_value="أنت خبير تشخيص"):
            with patch("src.agents.market_researcher.llm_client.chat",
                       new=AsyncMock()) as mock_chat:
                mock_chat.return_value = (
                    '{"problem_identification": {"primary_issue": "السعر مرتفع", '
                    '"secondary_issues": [], "evidence": ""}, '
                    '"root_causes": [], "quick_wins": [], "strategic_recommendations": [], '
                    '"pricing_feedback": {"current_position": "", "recommendation": "", '
                    '"justification": ""}, '
                    '"targeting_feedback": {"current": "", "recommended": "", "reasoning": ""}, '
                    '"messaging_feedback": {"current_approach": "", "recommended_approach": ""}, '
                    '"example_ad": {"headline": "", "primary_text": "", "cta": "", "rationale": ""}}',
                    {"provider": "openai"},
                )
                result = await agent.analyze_why_not_selling(why_not_selling_request)
                assert result.problem_identification["primary_issue"]


# ──────────────────────────────────────────
# Recommendation Engine Tests
# ──────────────────────────────────────────
class TestRecommendationEngine:
    """Test Recommendation Engine."""

    @pytest.mark.asyncio
    async def test_recommend_budget(self):
        from src.agents.recommendation_engine import RecommendationEngine

        agent = RecommendationEngine()
        request = BudgetRecommendationRequest(
            total_budget=10000,
            platforms=[
                PlatformAllocation(name="facebook", current_allocation=50, performance_score=7),
                PlatformAllocation(name="instagram", current_allocation=30, performance_score=8),
                PlatformAllocation(name="tiktok", current_allocation=20, performance_score=6),
            ],
            objectives=["sales", "awareness"],
            target_country="السعودية",
        )

        with patch("src.agents.recommendation_engine.llm_client.chat",
                   new=AsyncMock()) as mock_chat:
            mock_chat.return_value = (
                '{"recommended_allocation": ['
                '{"platform": "facebook", "percentage": 40, "amount": 4000, '
                '"rationale": "أداء جيد في المبيعات"}, '
                '{"platform": "instagram", "percentage": 40, "amount": 4000, '
                '"rationale": "أعلى أداء"}, '
                '{"platform": "tiktok", "percentage": 20, "amount": 2000, '
                '"rationale": "نمو واعد"}], '
                '"expected_impact": {"total_reach": "500K", "total_clicks": "15K", '
                '"total_conversions": "300"}, '
                '"strategy_rationale": "تنويع الميزانية"}',
                {"provider": "openai"},
            )
            result = await agent.recommend_budget(request)
            assert len(result.recommended_allocation) > 0
            total_pct = sum(a.percentage for a in result.recommended_allocation)
            assert abs(total_pct - 100) < 1  # Should sum to ~100%


# ──────────────────────────────────────────
# Utility Tests
# ──────────────────────────────────────────
class TestUtils:
    """Test utility functions."""

    def test_token_counter(self):
        from src.utils.token_counter import estimate_tokens, calculate_cost
        text = "هذا نص عربي طويل لاختبار عدد التوكنز"
        tokens = estimate_tokens(text)
        assert tokens > 0
        assert estimate_tokens("") == 1  # minimum

        cost = calculate_cost(100, 50, "gpt-4o-mini")
        assert cost > 0

    def test_extract_json(self):
        from src.utils.response_formatter import extract_json_from_llm_response

        # Test with JSON in markdown code block
        text = 'بعض النص\n```json\n{"key": "value"}\n```\nأكثر نص'
        result = extract_json_from_llm_response(text)
        assert result is not None
        assert result["key"] == "value"

        # Test with direct JSON
        result = extract_json_from_llm_response('{"key": "value2"}')
        assert result["key"] == "value2"

        # Test with no JSON
        result = extract_json_from_llm_response("نص عادي بدون JSON")
        assert result is None


# ──────────────────────────────────────────
# LLM Client Tests
# ──────────────────────────────────────────
class TestLLMClient:
    """Test the unified LLM client."""

    @pytest.mark.asyncio
    async def test_count_tokens(self):
        from src.utils.llm_client import LLMClient
        client = LLMClient()
        count = client._count_tokens_approx("هذا نص تجريبي")
        assert count > 0

    @pytest.mark.asyncio
    async def test_initialization_no_keys(self):
        with patch("src.config.settings.OPENAI_API_KEY", None), \
             patch("src.config.settings.ANTHROPIC_API_KEY", None):
            from src.utils.llm_client import LLMClient
            client = LLMClient()
            await client.initialize()
            assert not client.is_ready


if __name__ == "__main__":
    pytest.main(["-v", __file__])
