"""
Market Research Agent — أبحاث السوق وتحليل "ليه مش ببيع؟"
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List

from src.config import settings
from src.schemas.market import (
    CompetitorLandscape,
    CustomerInsights,
    EntryStrategy,
    ExampleAd,
    MarketAnalysisRequest,
    MarketAnalysisResponse,
    MarketSize,
    MarketTrend,
    MessagingFeedback,
    PricingAnalysis,
    PricingFeedback,
    QuickWin,
    RootCause,
    Seasonality,
    StrategicRecommendation,
    SWOT,
    TargetingFeedback,
    WhyNotSellingRequest,
    WhyNotSellingResponse,
)
from src.utils.llm_client import llm_client
from src.utils.response_formatter import extract_json_from_llm_response, parse_llm_response_to_model

logger = logging.getLogger(__name__)


class MarketResearcherAgent:
    """
    Agent for market research, analysis, and sales diagnostics.
    وكيل أبحاث السوق وتحليل مشاكل المبيعات
    """

    def __init__(self):
        self._system_prompt_market = self._load_prompt("market_researcher.txt")
        self._system_prompt_wns = self._load_prompt("why_not_selling.txt")

    def _load_prompt(self, filename: str) -> str:
        try:
            import os
            path = os.path.join(os.path.dirname(__file__), "..", "prompts", filename)
            with open(path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return ""

    async def analyze_market(self, request: MarketAnalysisRequest) -> MarketAnalysisResponse:
        """
        Comprehensive market analysis for a product in a target country.

        تحليل سوق شامل لمنتج في دولة مستهدفة
        """
        start_time = time.time()
        logger.info(
            f"Analyzing market for {request.product_name} in {request.target_country}"
        )

        user_prompt = (
            f"المنتج: {request.product_name}\n"
            f"فئة المنتج: {request.product_category}\n"
            f"الدولة المستهدفة: {request.target_country}\n"
            f"الجمهور المستهدف: {request.target_audience or 'عام'}\n\n"
            f"يرجى تحليل السوق بشكل شامل حسب التعليمات أعلاه."
        )

        response_text, metadata = await llm_client.chat(
            system_prompt=self._system_prompt_market or "أنت خبير أبحاث سوق.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_CHAT,
            model=settings.OPENAI_GENERATION_MODEL,
        )

        result = parse_llm_response_to_model(
            response_text,
            MarketAnalysisResponse,
            fallback=self._default_market_analysis(request),
        )

        logger.info(
            f"Market analysis complete in {int((time.time() - start_time) * 1000)}ms"
        )
        return result

    async def analyze_why_not_selling(
        self, request: WhyNotSellingRequest
    ) -> WhyNotSellingResponse:
        """
        Diagnose why a product isn't selling well.

        تشخيص أسباب ضعف المبيعات
        """
        start_time = time.time()
        logger.info(
            f"Diagnosing sales issues for {request.product_name} in {request.target_country}"
        )

        user_prompt = (
            f"المنتج: {request.product_name}\n"
            f"فئة المنتج: {request.product_category}\n"
            f"الدولة: {request.target_country}\n"
            f"السعر الحالي: ${request.price}\n"
            f"عدد مرات الظهور: {request.sales_data.impressions}\n"
            f"عدد النقرات: {request.sales_data.clicks}\n"
            f"عدد التحويلات: {request.sales_data.conversions}\n"
            f"نسبة التحويل: {request.sales_data.conversion_rate}%\n"
        )
        if request.sales_data.competitor_prices:
            user_prompt += (
                f"أسعار المنافسين: {request.sales_data.competitor_prices}\n"
            )
        if request.sales_data.customer_feedback:
            user_prompt += (
                f"ملاحظات العملاء: {request.sales_data.customer_feedback}\n"
            )
        if request.current_campaigns:
            user_prompt += f"الحملات الحالية: {request.current_campaigns}\n"

        response_text, metadata = await llm_client.chat(
            system_prompt=self._system_prompt_wns or "أنت خبير تشخيص مشاكل المبيعات.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_GENERATION,
            model=settings.OPENAI_GENERATION_MODEL,
        )

        result = parse_llm_response_to_model(
            response_text,
            WhyNotSellingResponse,
            fallback=self._default_wns_analysis(request),
        )

        logger.info(
            f"Why-not-selling analysis complete in "
            f"{int((time.time() - start_time) * 1000)}ms"
        )
        return result

    def _default_market_analysis(self, request: MarketAnalysisRequest) -> Dict[str, Any]:
        """Fallback market analysis."""
        return {
            "market_size": {
                "total_addressable": f"سوق {request.product_category} في {request.target_country} - يتطلب بحث إضافي",
                "serviceable": "غير محدد - يتطلب بيانات إضافية",
                "obtainable": "غير محدد - يتطلب تحليل المنافسة",
                "currency": "SAR",
                "source": "تقدير مبدئي",
            },
            "market_trends": [
                {
                    "trend": "نمو التجارة الإلكترونية",
                    "description": f"السوق الرقمي في {request.target_country} في نمو مستمر",
                    "impact": "positive",
                    "data_points": ["معدل نمو سنوي 15-20%"],
                }
            ],
            "seasonality": [
                {"month": m, "demand_level": 7, "notes": "موسم عام"}
                for m in range(1, 13)
            ],
            "competitor_landscape": [
                {
                    "name": "منافس رئيسي",
                    "market_share_estimate": "غير محدد",
                    "strengths": ["تواجد قوي في السوق"],
                    "weaknesses": ["معلومات محدودة"],
                    "price_range": "متفاوت",
                }
            ],
            "pricing_analysis": {
                "avg_price": request.product_category == "الكترونيات" and 500 or 150,
                "price_range": "100 - 500",
                "recommended_price": request.product_category == "الكترونيات" and 450 or 175,
                "reasoning": "تقدير مبدئي بناءً على فئة المنتج",
            },
            "customer_insights": {
                "demographics": ["يحتاج تحليل إضافي"],
                "psychographics": ["يحتاج تحليل إضافي"],
                "pain_points": ["يحتاج تحليل إضافي"],
                "desires": ["يحتاج تحليل إضافي"],
                "buying_factors": ["السعر", "الجودة", "الثقة"],
            },
            "swot": {
                "strengths": ["منتج جديد بمواصفات جيدة"],
                "weaknesses": ["لا توجد بيانات كافية عن السوق"],
                "opportunities": ["سوق نامٍ للتجارة الإلكترونية"],
                "threats": ["منافسة من علامات تجارية راسخة"],
            },
            "entry_strategy": {
                "recommended_channels": ["فيسبوك", "إنستغرام", "تيك توك"],
                "budget_range": "$3,000 - $10,000 شهرياً",
                "timeline": "3-6 أشهر",
                "key_metrics": ["الوعي بالعلامة التجارية", "حركة المرور", "التحويلات"],
                "risks": ["تشبع السوق", "تغير سلوك المستهلك"],
            },
        }

    def _default_wns_analysis(self, request: WhyNotSellingRequest) -> Dict[str, Any]:
        """Fallback why-not-selling analysis."""
        return {
            "problem_identification": {
                "primary_issue": "تحتاج بيانات إضافية للتشخيص الدقيق",
                "secondary_issues": ["ضعف التحويل", "قد يكون السعر أو الاستهداف أو الرسالة"],
                "evidence": f"نسبة تحويل {request.sales_data.conversion_rate}% قد تشير إلى مشكلة في الاستهداف أو الصفحة المقصودة",
            },
            "root_causes": [
                {
                    "cause": "احتمال ضعف الاستهداف",
                    "impact_level": "high",
                    "explanation": "نسبة النقر إلى الظهور منخفضة قد تعني أن الإعلان يصل لجمهور غير مناسب",
                },
                {
                    "cause": "احتمال مشكلة في الصفحة المقصودة",
                    "impact_level": "high",
                    "explanation": "ارتفاع النقرات مع انخفاض التحويل يشير إلى مشكلة في تجربة المستخدم بعد النقر",
                },
            ],
            "quick_wins": [
                {
                    "action": "تحسين الصفحة المقصودة",
                    "expected_impact": "زيادة التحويلات بنسبة 20-50%",
                    "effort": "medium",
                    "time_to_result": "1-2 أسبوع",
                }
            ],
            "strategic_recommendations": [
                {
                    "area": "الاستهداف",
                    "action": "إعادة تعريف الجمهور المستهدف واختبار شرائح جديدة",
                    "timeline": "2-4 أسابيع",
                    "expected_outcome": "تحسين جودة الزوار وزيادة التحويلات",
                }
            ],
            "pricing_feedback": {
                "current_position": f"السعر الحالي ${request.price}",
                "recommendation": "قارن السعر مع أسعار المنافسين المباشرين",
                "justification": "تأثير السعر على قرار الشراء يختلف حسب فئة المنتج",
            },
            "targeting_feedback": {
                "current": "الاستهداف الحالي غير محدد",
                "recommended": "استهداف الجمهور بناءً على الاهتمامات والسلوك",
                "reasoning": "الاستهداف الدقيق يحسن جودة الزوار",
            },
            "messaging_feedback": {
                "current_approach": "غير محدد",
                "recommended_approach": "التركيز على القيمة الفريدة للمنتج وحل مشاكل العميل",
            },
            "example_ad": {
                "headline": f"مشكلة {request.product_category}؟ {request.product_name} هو الحل!",
                "primary_text": f"هل تواجه صعوبات في {request.product_category}؟ "
                               f"مع {request.product_name}، وداعاً للمشاكل. "
                               f"جربه اليوم واحصل على خصم 20%!",
                "cta": "اشتري الآن",
                "rationale": "إعلان يركز على حل المشكلة ويقدم عرضاً مغرياً",
            },
        }
