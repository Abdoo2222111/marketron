"""
Arabic NLP Agent — معالجة اللغة العربية: تحليل المشاعر، استخراج الكلمات المفتاحية، محتوى SEO
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

from src.config import settings
from src.schemas.market import (
    ExtractKeywordsRequest,
    ExtractKeywordsResponse,
    GenerateSEOContentRequest,
    GenerateSEOContentResponse,
    SentimentAnalysisRequest,
    SentimentAnalysisResponse,
)
from src.utils.llm_client import llm_client
from src.utils.response_formatter import extract_json_from_llm_response

logger = logging.getLogger(__name__)

# Arabic sentiment keywords (fallback when LLM is unavailable)
ARABIC_POSITIVE_WORDS: set = {
    "رائع", "ممتاز", "جميل", "حلو", "مذهل", "أفضل", "ممتازة", "جميلة",
    "سعيد", "سعيدة", "فرحان", "مبسوط", "شكراً", "شكرا", "يعجبني",
    "أعجبني", "حب", "أحب", "ممتاز جدا", "جودة", "متميز", "فخور",
    "ناجح", "مفيد", "قيمة", "ممتعة", "لذيذ", "جميل جداً",
}
ARABIC_NEGATIVE_WORDS: set = {
    "سيء", "سيئة", "قبيح", "رديء", "فظيع", "مخيب", "ممل", "تقيل",
    "غالي", "مكلف", "بطيء", "مزعج", "كسر", "عطلان", "خربان",
    "حزين", "زعلان", "غضبان", "مستاء", "سيئ", "غير مفيد", "رديئة",
    "مخيبة", "خسارة", "ندم", "نادم", "كارثة", "أزمة",
}


class ArabicNLPAgent:
    """
    Agent for Arabic NLP tasks: sentiment analysis, keyword extraction, SEO content generation.

    وكيل معالجة اللغة العربية: تحليل المشاعر، استخراج الكلمات المفتاحية، توليد محتوى SEO
    """

    def __init__(self):
        self._camel_tools_available = False
        self._farasa_available = False
        self._init_local_libs()

    def _init_local_libs(self):
        """Attempt to initialize local Arabic NLP libraries."""
        try:
            # Camel Tools for Arabic NLP
            import camel_tools  # noqa
            self._camel_tools_available = True
            logger.info("Camel Tools is available for Arabic NLP")
        except ImportError:
            logger.info("Camel Tools not installed. Using LLM-based Arabic NLP.")
            pass

        try:
            import farasa  # noqa
            self._farasa_available = True
            logger.info("Farasa is available for Arabic NLP")
        except ImportError:
            pass

    async def analyze_sentiment(
        self, request: SentimentAnalysisRequest
    ) -> SentimentAnalysisResponse:
        """
        Analyze sentiment of Arabic text.

        تحليل المشاعر في النصوص العربية
        """
        start_time = time.time()
        logger.info(f"Analyzing sentiment for text ({len(request.text)} chars)")

        # Try keyword-based fallback first for speed
        words = request.text.split()
        pos_count = sum(1 for w in words if w in ARABIC_POSITIVE_WORDS)
        neg_count = sum(1 for w in words if w in ARABIC_NEGATIVE_WORDS)

        if pos_count > 0 or neg_count > 0:
            # Keyword-based gives us a quick result
            if pos_count > neg_count:
                score = min(1.0, pos_count / max(len(words), 1) * 5)
                sentiment = "positive"
            elif neg_count > pos_count:
                score = max(-1.0, -neg_count / max(len(words), 1) * 5)
                sentiment = "negative"
            else:
                score = 0.0
                sentiment = "neutral"

            # Still try LLM for more nuanced analysis (async, don't block)
            try:
                response_text, metadata = await llm_client.chat(
                    system_prompt="أنت خبير في تحليل المشاعر في النصوص العربية.",
                    user_prompt=(
                        f"حلل المشاعر في النص التالي:\n\n{request.text}\n\n"
                        f"أعد النتيجة بصيغة JSON: sentiment (positive/negative/neutral/mixed), "
                        f"score (-1 to 1), emotion, aspects (اختياري)."
                    ),
                    temperature=0.1,  # Low temp for analysis
                )
                data = extract_json_from_llm_response(response_text)
                if data:
                    return SentimentAnalysisResponse(
                        sentiment=data.get("sentiment", sentiment),
                        score=float(data.get("score", score)),
                        aspects=data.get("aspects"),
                        emotion=data.get("emotion"),
                    )
            except Exception:
                pass  # Fall back to keyword result

            return SentimentAnalysisResponse(
                sentiment=sentiment,
                score=score,
            )

        # Use LLM for full analysis
        try:
            response_text, metadata = await llm_client.chat(
                system_prompt="أنت خبير في تحليل المشاعر في النصوص العربية الفصحى واللهجات.",
                user_prompt=(
                    f"حلل المشاعر في النص التالي:\n\n{request.text}\n\n"
                    f"أعد النتيجة بصيغة JSON: sentiment (positive/negative/neutral/mixed), "
                    f"score (-1 to 1), emotion (optional), aspects (optional array of {{topic, sentiment, score}})"
                ),
                temperature=0.1,
            )
            data = extract_json_from_llm_response(response_text)
            if data:
                return SentimentAnalysisResponse(
                    sentiment=data.get("sentiment", "neutral"),
                    score=float(data.get("score", 0.0)),
                    aspects=data.get("aspects"),
                    emotion=data.get("emotion"),
                )
        except Exception as e:
            logger.warning(f"LLM sentiment analysis failed, using fallback: {e}")

        return SentimentAnalysisResponse(
            sentiment="neutral",
            score=0.0,
            emotion="غير محدد",
        )

    async def extract_keywords(
        self, request: ExtractKeywordsRequest
    ) -> ExtractKeywordsResponse:
        """
        Extract keywords from Arabic text.

        استخراج كلمات مفتاحية من نصوص عربية
        """
        start_time = time.time()
        logger.info(f"Extracting keywords from text ({len(request.text)} chars)")

        # Try local NLP tools first
        if self._camel_tools_available:
            try:
                return self._extract_keywords_cameltools(request)
            except Exception as e:
                logger.warning(f"Camel Tools keyword extraction failed: {e}")

        # Fall back to LLM
        try:
            response_text, metadata = await llm_client.chat(
                system_prompt="أنت خبير في استخراج الكلمات المفتاحية من النصوص العربية.",
                user_prompt=(
                    f"استخرج أهم {request.max_keywords} كلمة مفتاحية من النص التالي:\n\n"
                    f"{request.text}\n\n"
                    f"أعد النتيجة بصيغة JSON: keywords (array of strings), "
                    f"keyword_weights (object with keyword as key and weight 0-1 as value)."
                ),
                temperature=0.1,
            )
            data = extract_json_from_llm_response(response_text)
            if data:
                keywords = data.get("keywords", [])
                weights = data.get("keyword_weights")
                # Limit to requested count
                return ExtractKeywordsResponse(
                    keywords=keywords[: request.max_keywords],
                    keyword_weights=weights,
                )
        except Exception as e:
            logger.warning(f"LLM keyword extraction failed: {e}")

        return ExtractKeywordsResponse(
            keywords=["لا توجد كلمات كافية"],
        )

    async def generate_seo_content(
        self, request: GenerateSEOContentRequest
    ) -> GenerateSEOContentResponse:
        """
        Generate SEO-optimized Arabic content.

        توليد محتوى SEO بالعربية
        """
        start_time = time.time()
        logger.info(f"Generating SEO content for topic: {request.topic}")

        try:
            response_text, metadata = await llm_client.chat(
                system_prompt="أنت خبير في كتابة المحتوى التسويقي وتحسين محركات البحث (SEO) بالعربية.",
                user_prompt=(
                    f"اكتب محتوى SEO متوافق مع معايير تحسين محركات البحث للموضوع التالي:\n\n"
                    f"الموضوع: {request.topic}\n"
                    f"الكلمات المفتاحية المستهدفة: {', '.join(request.target_keywords)}\n"
                    f"اللغة: {request.language}\n"
                    f"عدد الكلمات التقريبي: {request.word_count} كلمة\n\n"
                    f"المتطلبات:\n"
                    f"1. ابدأ بعنوان جذاب (H1)\n"
                    f"2. أضف وصف ميتا (meta description)\n"
                    f"3. استخدم الكلمات المفتاحية بشكل طبيعي\n"
                    f"4. استخدم ترويسات فرعية (H2، H3)\n"
                    f"5. اجعل المحتوى غنياً بالمعلومات وقابلاً للقراءة\n\n"
                    f"أعد النتيجة بصيغة JSON: title, meta_description, content, keywords_used, seo_score (0-100)"
                ),
                temperature=settings.LLM_TEMPERATURE_GENERATION,
                model=settings.OPENAI_GENERATION_MODEL,
            )

            data = extract_json_from_llm_response(response_text)
            if data:
                return GenerateSEOContentResponse(
                    title=data.get("title", request.topic),
                    meta_description=data.get("meta_description", ""),
                    content=data.get("content", ""),
                    keywords_used=data.get("keywords_used", request.target_keywords),
                    seo_score=min(data.get("seo_score", 70), 100),
                )
        except Exception as e:
            logger.warning(f"SEO content generation failed: {e}")

        return GenerateSEOContentResponse(
            title=request.topic,
            meta_description=f"اكتشف كل ما تريد معرفته عن {request.topic} - دليل شامل",
            content=f"هذا المحتوى قيد الإنشاء حول {request.topic}. يرجى المحاولة مرة أخرى.",
            keywords_used=request.target_keywords,
            seo_score=50,
        )

    def _extract_keywords_cameltools(
        self, request: ExtractKeywordsRequest
    ) -> ExtractKeywordsResponse:
        """Use Camel Tools for keyword extraction."""
        from camel_tools.utils.normalize import normalize_unicode
        from camel_tools.utils.dediac import dediac_ar

        text = dediac_ar(normalize_unicode(request.text))

        # Simple TF-based extraction
        import re
        words = re.findall(r'\b\w{3,}\b', text)
        word_freq: Dict[str, int] = {}
        for w in words:
            word_freq[w] = word_freq.get(w, 0) + 1

        # Sort by frequency and take top N
        sorted_words = sorted(word_freq.items(), key=lambda x: -x[1])
        keywords = [w for w, f in sorted_words[: request.max_keywords]]
        total = sum(f for _, f in sorted_words[: request.max_keywords]) or 1
        weights = {w: round(f / total, 2) for w, f in sorted_words[: request.max_keywords]}

        return ExtractKeywordsResponse(keywords=keywords, keyword_weights=weights)
