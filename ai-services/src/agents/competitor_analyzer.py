"""
Competitor Analysis Agent — تحليل المنافسين
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List

from src.config import settings
from src.schemas.analysis import (
    CompetitorAnalysisRequest,
    CompetitorAnalysisResponse,
    CompetitorComparisonRequest,
    CompetitorComparisonResponse,
    ComparisonMatrixItem,
    CompetitiveProfile,
)
from src.utils.llm_client import llm_client
from src.utils.response_formatter import extract_json_from_llm_response, parse_llm_response_to_model
from src.utils.token_counter import estimate_tokens

logger = logging.getLogger(__name__)


class CompetitorAnalyzerAgent:
    """
    Agent for analyzing competitors in the market.
    وكيل تحليل المنافسين في السوق
    """

    def __init__(self):
        self._system_prompt = self._load_prompt()

    def _load_prompt(self) -> str:
        try:
            import os
            path = os.path.join(
                os.path.dirname(__file__), "..", "prompts", "competitor_analyzer.txt"
            )
            with open(path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return ""

    async def analyze_competitor(
        self, request: CompetitorAnalysisRequest
    ) -> CompetitorAnalysisResponse:
        """
        Analyze a single competitor's strategy and positioning.

        تحليل استراتيجية منافس واحد
        """
        start_time = time.time()
        logger.info(f"Analyzing competitor: {request.competitor_name}")

        user_prompt = (
            f"اسم المنافس: {request.competitor_name}\n"
            f"المنصة: {request.platform.value}\n"
            f"الدولة: {request.country}\n"
            f"فئة المنتج: {request.product_category}\n"
        )
        if request.known_ads:
            user_prompt += f"الإعلانات المعروفة: {request.known_ads}\n"

        response_text, metadata = await llm_client.chat(
            system_prompt=self._system_prompt or "أنت خبير تحليل منافسين.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_CHAT,
        )

        result = parse_llm_response_to_model(
            response_text,
            CompetitorAnalysisResponse,
            fallback=self._default_competitor_analysis(request.competitor_name),
        )

        logger.info(
            f"Competitor analysis complete for {request.competitor_name} in "
            f"{int((time.time() - start_time) * 1000)}ms"
        )
        return result

    async def compare_competitors(
        self, request: CompetitorComparisonRequest
    ) -> CompetitorComparisonResponse:
        """
        Compare multiple competitors side by side.

        مقارنة بين عدة منافسين
        """
        start_time = time.time()
        comp_names = [c.name for c in request.competitors]
        logger.info(f"Comparing competitors: {', '.join(comp_names)}")

        comp_details = []
        for c in request.competitors:
            comp_details.append(
                f"- {c.name} (منصة: {c.platform.value}, "
                f"الإنفاق التقديري: {c.estimated_spend}, "
                f"عدد الإعلانات: {c.active_ads_count}, "
                f"أبرز العناوين: {c.top_headlines})"
            )

        user_prompt = (
            f"قارن بين المنافسين التاليين:\n\n"
            f"{chr(10).join(comp_details)}\n\n"
            f"قدم مصفوفة مقارنة لكل منافس في المجالات التالية: "
            f"الحصة السوقية، الابتكار، التسعير، الرسائل التسويقية، الشكل البصري\n"
            f"حدد موقع السوق، فرص المحيط الأزرق، والاستراتيجية الموصى بها.\n"
            f"أعد النتيجة بصيغة JSON."
        )

        response_text, metadata = await llm_client.chat(
            system_prompt="أنت خبير استراتيجي في المقارنات التنافسية.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_CHAT,
        )

        data = extract_json_from_llm_response(response_text)

        if not data:
            return CompetitorComparisonResponse(
                comparison_matrix=[
                    ComparisonMatrixItem(
                        name=c.name,
                        market_share=5,
                        innovation=5,
                        pricing=5,
                        messaging=5,
                        visual=5,
                    )
                    for c in request.competitors
                ],
                market_position="تحتاج بيانات إضافية لتحديد وضع السوق بدقة.",
                blue_ocean_opportunities=["تحتاج تحليل أعمق للسوق"],
                recommended_strategy="مراقبة المنافسين وجمع المزيد من البيانات",
            )

        matrix = []
        for item in data.get("comparison_matrix", []):
            matrix.append(ComparisonMatrixItem(
                name=item.get("name", ""),
                market_share=item.get("market_share", 5),
                innovation=item.get("innovation", 5),
                pricing=item.get("pricing", 5),
                messaging=item.get("messaging", 5),
                visual=item.get("visual", 5),
            ))

        return CompetitorComparisonResponse(
            comparison_matrix=matrix,
            market_position=data.get("market_position", ""),
            blue_ocean_opportunities=data.get("blue_ocean_opportunities", []),
            recommended_strategy=data.get("recommended_strategy", ""),
        )

    def _default_competitor_analysis(self, name: str) -> Dict[str, Any]:
        """Fallback analysis when LLM fails."""
        return {
            "competitive_profile": {
                "estimated_monthly_spend": "غير متاح",
                "primary_platforms": ["فيسبوك", "إنستغرام"],
                "ad_strategy": "تحتاج تحليل إضافي",
                "messaging_style": "غير محدد",
                "visual_style": "غير محدد",
            },
            "strengths": ["يتطلب تحليل إضافي"],
            "weaknesses": ["يتطلب تحليل إضافي"],
            "opportunities": ["يتطلب تحليل إضافي"],
            "threats": ["يتطلب تحليل إضافي"],
            "recommendations": [
                {
                    "area": "جمع البيانات",
                    "action": f"جمع المزيد من المعلومات عن {name}",
                    "priority": "high",
                }
            ],
        }
