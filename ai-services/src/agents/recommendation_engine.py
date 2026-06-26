"""
Recommendation Engine Agent — محرك التوصيات
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List

from src.config import settings
from src.schemas.market import (
    BudgetRecommendationRequest,
    BudgetRecommendationResponse,
    ExpectedImpact,
    RecommendedAllocation,
    TargetingRecommendationRequest,
    TargetingRecommendationResponse,
    TimingRecommendationRequest,
    TimingRecommendationResponse,
    HourScore,
)
from src.utils.llm_client import llm_client
from src.utils.response_formatter import extract_json_from_llm_response, parse_llm_response_to_model

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    Engine for budget, targeting, and timing recommendations.
    محرك التوصيات: الميزانية، الاستهداف، التوقيت
    """

    def __init__(self):
        self._system_prompt = self._load_prompt()

    def _load_prompt(self) -> str:
        try:
            import os
            path = os.path.join(os.path.dirname(__file__), "..", "prompts", "recommendations.txt")
            with open(path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return ""

    async def recommend_budget(
        self, request: BudgetRecommendationRequest
    ) -> BudgetRecommendationResponse:
        """
        Recommend optimal budget allocation across platforms.

        توصية بتوزيع الميزانية الأمثل عبر المنصات
        """
        start_time = time.time()
        logger.info(
            f"Recommending budget allocation: ${request.total_budget} "
            f"across {len(request.platforms)} platforms"
        )

        platforms_detail = []
        for p in request.platforms:
            platforms_detail.append(
                f"- {p.name}: التخصيص الحالي {p.current_allocation}%, "
                f"درجة الأداء {p.performance_score}/10"
            )

        user_prompt = (
            f"إجمالي الميزانية: ${request.total_budget}\n"
            f"المنصات:\n{chr(10).join(platforms_detail)}\n"
            f"الأهداف: {', '.join(request.objectives)}\n"
            f"الدولة: {request.target_country}\n\n"
            f"قدم توصية بتوزيع الميزانية مع توقعات الأداء.\n"
            f"أعد النتيجة بصيغة JSON."
        )

        response_text, metadata = await llm_client.chat(
            system_prompt=self._system_prompt or "أنت خبير توزيع ميزانيات الإعلانات.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_CHAT,
        )

        data = extract_json_from_llm_response(response_text)

        if not data:
            # Equal distribution fallback
            count = len(request.platforms) or 1
            per_platform = 100.0 / count
            allocations = [
                RecommendedAllocation(
                    platform=p.name,
                    percentage=round(per_platform, 1),
                    amount=round(request.total_budget * per_platform / 100, 2),
                    rationale=f"توزيع متساوٍ لجميع المنصات ({per_platform:.0f}%)",
                )
                for p in request.platforms
            ]
            return BudgetRecommendationResponse(
                recommended_allocation=allocations,
                expected_impact=ExpectedImpact(
                    total_reach="يعتمد على المنصة والميزانية",
                    total_clicks="يعتمد على معدلات النقر",
                    total_conversions="يعتمد على معدلات التحويل",
                ),
                strategy_rationale="توزيع متساوٍ للميزانية كخطة أساسية. يفضل تحسين التوزيع بناءً على أداء كل منصة.",
            )

        allocations = []
        for item in data.get("recommended_allocation", []):
            allocations.append(RecommendedAllocation(
                platform=item.get("platform", ""),
                percentage=item.get("percentage", 0),
                amount=item.get("amount", 0),
                rationale=item.get("rationale", ""),
            ))

        impact = data.get("expected_impact", {})
        return BudgetRecommendationResponse(
            recommended_allocation=allocations,
            expected_impact=ExpectedImpact(
                total_reach=impact.get("total_reach", ""),
                total_clicks=impact.get("total_clicks", ""),
                total_conversions=impact.get("total_conversions", ""),
            ),
            strategy_rationale=data.get("strategy_rationale", ""),
        )

    async def recommend_targeting(
        self, request: TargetingRecommendationRequest
    ) -> TargetingRecommendationResponse:
        """
        Recommend audience targeting improvements.

        توصيات لتحسين استهداف الجمهور
        """
        start_time = time.time()

        user_prompt = (
            f"المنتج: {request.product}\n"
            f"الدولة: {request.country}\n"
            f"الاستهداف الحالي: {request.current_targeting}\n"
        )
        if request.campaign_performance_data:
            user_prompt += (
                f"بيانات أداء الحملة: {request.campaign_performance_data}\n"
            )

        user_prompt += (
            "\nقدم توصيات لتحسين استهداف الجمهور تشمل: "
            "الفئة العمرية، الجنس، الاهتمامات، المواقع، اقتراحات Lookalike.\n"
            "قدم شرحاً مفصلاً لكل توصية.\n"
            "أعد النتيجة بصيغة JSON."
        )

        response_text, metadata = await llm_client.chat(
            system_prompt="أنت خبير في استهداف الجماهير وتحسين الحملات الإعلانية.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_CHAT,
        )

        data = extract_json_from_llm_response(response_text)
        if not data:
            return TargetingRecommendationResponse(
                recommended={
                    "age_range": "25-45",
                    "gender": "الجميع",
                    "interests": ["مرتبطة بفئة المنتج"],
                    "locations": [request.country],
                    "lookalike_suggestions": ["إنشاء جمهور مشابه من العملاء الحاليين"],
                },
                rationale="توصية مبدئية بناءً على المعلومات المتاحة.",
            )

        return TargetingRecommendationResponse(
            recommended=data.get("recommended", {}),
            rationale=data.get("rationale", ""),
        )

    async def recommend_timing(
        self, request: TimingRecommendationRequest
    ) -> TimingRecommendationResponse:
        """
        Recommend best posting times for ads.

        أفضل أوقات النشر للحملات الإعلانية
        """
        start_time = time.time()

        user_prompt = (
            f"المنصة: {request.platform.value}\n"
            f"الدولة: {request.target_country}\n"
            f"الجمهور المستهدف: {request.target_audience or 'عام'}\n"
            f"المجال: {request.industry}\n\n"
            f"قدم أفضل أيام وساعات النشر مع درجات التقييم (1-10).\n"
            f"أعد النتيجة بصيغة JSON مع الحقول: best_days, best_hours, timezone, recommendations"
        )

        response_text, metadata = await llm_client.chat(
            system_prompt="أنت خبير في تحديد أفضل أوقات النشر للإعلانات الرقمية.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_CHAT,
        )

        data = extract_json_from_llm_response(response_text)

        if not data:
            # Default times based on platform
            default_hours = []
            for h in range(24):
                score = 5.0
                if 10 <= h <= 12:
                    score = 8.5
                elif 17 <= h <= 21:
                    score = 9.0
                elif 22 <= h <= 23 or 0 <= h <= 6:
                    score = 3.0
                default_hours.append(HourScore(hour=h, score=score))

            return TimingRecommendationResponse(
                best_days=["الخميس", "الجمعة", "السبت"],
                best_hours=default_hours,
                timezone="Asia/Riyadh (UTC+3)",
                recommendations=["جرب أوقات مختلفة وحلل الأداء", "اختبر A/B لأوقات النشر"],
            )

        hours = []
        for h in data.get("best_hours", []):
            hours.append(HourScore(hour=h.get("hour", 0), score=h.get("score", 5)))

        return TimingRecommendationResponse(
            best_days=data.get("best_days", []),
            best_hours=hours,
            timezone=data.get("timezone", "Asia/Riyadh (UTC+3)"),
            recommendations=data.get("recommendations", []),
        )
