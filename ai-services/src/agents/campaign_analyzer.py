"""
Campaign Analysis Agent — تحليل الحملات الإعلانية
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

from src.config import settings
from src.schemas.analysis import (
    BenchmarkComparison,
    CampaignAnalysisRequest,
    CampaignAnalysisResponse,
    OptimizationOpportunity,
    PerformancePredictionRequest,
    PerformancePredictionResponse,
    Recommendation,
)
from src.utils.llm_client import llm_client
from src.utils.response_formatter import extract_json_from_llm_response, parse_llm_response_to_model

logger = logging.getLogger(__name__)


class CampaignAnalyzerAgent:
    """
    Agent for analyzing campaign performance and predicting outcomes.
    وكيل تحليل أداء الحملات الإعلانية وتوقع النتائج
    """

    def __init__(self):
        self._system_prompt = self._load_prompt()

    def _load_prompt(self) -> str:
        try:
            import os
            path = os.path.join(os.path.dirname(__file__), "..", "prompts", "campaign_analyzer.txt")
            with open(path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return ""

    async def analyze_campaign(
        self, request: CampaignAnalysisRequest
    ) -> CampaignAnalysisResponse:
        """
        Analyze a campaign's performance and provide recommendations.

        تحليل أداء الحملة الإعلانية وتقديم توصيات
        """
        start_time = time.time()
        cd = request.campaign_data
        logger.info(
            f"Analyzing campaign for {cd.platform.value} - {cd.objective} "
            f"({cd.impressions} impressions, ${cd.spend} spend)"
        )

        user_prompt = (
            f"مرات الظهور: {cd.impressions}\n"
            f"النقرات: {cd.clicks}\n"
            f"التحويلات: {cd.conversions}\n"
            f"الإنفاق: ${cd.spend}\n"
            f"الإيرادات: ${cd.revenue}\n"
            f"المنصة: {cd.platform.value}\n"
            f"الهدف: {cd.objective}\n"
            f"الدولة: {request.country}\n"
            f"فئة المنتج: {request.product_category}\n"
        )

        if cd.industry_averages:
            user_prompt += f"متوسطات الصناعة: {cd.industry_averages}\n"

        response_text, metadata = await llm_client.chat(
            system_prompt=self._system_prompt or "أنت خبير تحليل حملات إعلانية.",
            user_prompt=user_prompt,
            temperature=settings.LLM_TEMPERATURE_CHAT,
            model=settings.OPENAI_CHAT_MODEL,
        )

        result = parse_llm_response_to_model(
            response_text,
            CampaignAnalysisResponse,
            fallback=self._default_analysis(cd),
        )

        logger.info(
            f"Campaign analysis complete: score={result.overall_score}, "
            f"recs={len(result.recommendations)} in "
            f"{int((time.time() - start_time) * 1000)}ms"
        )
        return result

    async def predict_performance(
        self, request: PerformancePredictionRequest
    ) -> PerformancePredictionResponse:
        """
        Predict campaign performance before launch.

        توقع أداء الحملة قبل إطلاقها
        """
        start_time = time.time()

        prompt_text = (
            f"توقع أداء حملة إعلانية جديدة بالاعتماد على البيانات التالية:\n\n"
            f"الميزانية: ${request.budget}\n"
            f"المنصة: {request.platform.value}\n"
            f"الهدف: {request.objective}\n"
            f"الدولة: {request.target_country}\n"
            f"الفئة العمرية: {request.target_age_range}\n"
            f"الجنس: {request.target_gender}\n"
            f"المجال: {request.industry}\n"
            f"الموسم: {request.season}\n\n"
            f"قدم توقعات واقعية مع نطاق (min-max) لكل مؤشر.\n"
            f"أعد النتيجة بصيغة JSON."
        )

        response_text, metadata = await llm_client.chat(
            system_prompt="أنت خبير في توقع أداء الحملات الإعلانية بناءً على بيانات السوق.",
            user_prompt=prompt_text,
            temperature=settings.LLM_TEMPERATURE_CHAT,
        )

        data = extract_json_from_llm_response(response_text)

        if not data:
            # Default prediction
            base_cpm = 8.0 if request.platform.value in ["facebook", "instagram"] else 6.0
            base_ctr = 0.015 if request.platform.value in ["facebook", "instagram"] else 0.02
            estimated_impressions = int(request.budget / base_cpm * 1000)
            estimated_clicks = int(estimated_impressions * base_ctr)
            estimated_conversions = int(estimated_clicks * 0.05)
            cost_per_result = request.budget / max(estimated_conversions, 1)

            return PerformancePredictionResponse(
                predicted_impressions=estimated_impressions,
                predicted_clicks=estimated_clicks,
                predicted_conversions=estimated_conversions,
                predicted_cost_per_result=round(cost_per_result, 2),
                confidence_score=0.6,
                range={
                    "impressions": {"min": int(estimated_impressions * 0.7),
                                    "max": int(estimated_impressions * 1.3)},
                    "clicks": {"min": int(estimated_clicks * 0.6),
                               "max": int(estimated_clicks * 1.4)},
                    "conversions": {"min": int(estimated_conversions * 0.5),
                                    "max": int(estimated_conversions * 1.5)},
                },
                rationale="تقدير مبدئي بناءً على متوسطات الصناعة العامة.",
            )

        return PerformancePredictionResponse(
            predicted_impressions=data.get("predicted_impressions", 0),
            predicted_clicks=data.get("predicted_clicks", 0),
            predicted_conversions=data.get("predicted_conversions", 0),
            predicted_cost_per_result=data.get("predicted_cost_per_result", 0),
            confidence_score=min(data.get("confidence_score", 0.5), 1.0),
            range=data.get("range", {}),
            rationale=data.get("rationale", ""),
        )

    def _default_analysis(self, cd) -> Dict[str, Any]:
        """Generate a safe fallback analysis."""
        ctr = (cd.clicks / cd.impressions * 100) if cd.impressions else 0
        cpc = (cd.spend / cd.clicks) if cd.clicks else 0
        cpa = (cd.spend / cd.conversions) if cd.conversions else 0
        cpm = (cd.spend / cd.impressions * 1000) if cd.impressions else 0

        return {
            "overall_score": 5.0,
            "summary": "تم التحليل بناءً على البيانات المتاحة. يرجى مراجعة التوصيات أدناه.",
            "strengths": ["تم تحديد مؤشرات الأداء الرئيسية"],
            "weaknesses": ["نقص البيانات المقارنة", "تحتاج مزيد من التحليل"],
            "recommendations": [
                {
                    "priority": "high",
                    "action": "مراجعة وتحسين الاستهداف",
                    "expected_impact": "تحسين معدل التحويل بنسبة 20-30%",
                    "effort": "medium",
                },
                {
                    "priority": "medium",
                    "action": "اختبار A/B للرسائل الإعلانية",
                    "expected_impact": "زيادة نسبة النقر إلى الظهور",
                    "effort": "medium",
                },
            ],
            "benchmarks_comparison": {
                "ctr_benchmark": 2.5,
                "cpc_benchmark": 1.5,
                "cpa_benchmark": 20.0,
                "your_ctr": round(ctr, 2),
                "your_cpc": round(cpc, 2),
                "your_cpa": round(cpa, 2),
            },
            "optimization_opportunities": [
                {
                    "area": "معدل النقر (CTR)",
                    "current_value": f"{ctr:.2f}%",
                    "target_value": "2.5%",
                    "estimated_improvement": "تحسين النصوص الإعلانية",
                },
                {
                    "area": "تكلفة الاكتساب (CPA)",
                    "current_value": f"${cpa:.2f}",
                    "target_value": "$15.00",
                    "estimated_improvement": "تحسين صفحة الهبوط",
                },
            ],
        }
