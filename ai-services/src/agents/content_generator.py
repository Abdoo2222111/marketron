"""
Content Generation Agent — توليد المحتوى الإعلاني
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

from src.config import settings
from src.schemas.content import (
    AdTextItem,
    AdTextRequest,
    AdTextResponse,
    HashtagRequest,
    HashtagResponse,
    ImagePromptItem,
    ImagePromptRequest,
    ImagePromptResponse,
    VideoScriptItem,
    VideoScriptRequest,
    VideoScriptResponse,
)
from src.utils.llm_client import llm_client
from src.utils.response_formatter import extract_json_from_llm_response, parse_llm_response_to_model
from src.utils.token_counter import estimate_tokens

logger = logging.getLogger(__name__)


class ContentGeneratorAgent:
    """
    Agent responsible for generating ad content: text, image prompts, video scripts, and hashtags.
    وكيل توليد المحتوى الإعلاني: نصوص، أوصاف صور، سكريبتات فيديو، هاشتاجات
    """

    def __init__(self):
        self._system_prompt_text = self._load_prompt("ad_text_generator.txt")
        self._system_prompt_image = self._load_prompt("ad_text_generator.txt")  # reuse or have specific
        self._system_prompt_video = self._load_prompt("ad_text_generator.txt")

    def _load_prompt(self, filename: str) -> str:
        """Load prompt template from file."""
        try:
            import os
            prompt_path = os.path.join(
                os.path.dirname(__file__), "..", "prompts", filename
            )
            with open(prompt_path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            logger.warning(f"Prompt file {filename} not found, using default.")
            return ""

    async def generate_ad_text(self, request: AdTextRequest) -> AdTextResponse:
        """
        Generate ad text copies based on product details.

        توليد نصوص إعلانية بناءً على معلومات المنتج
        """
        start_time = time.time()
        logger.info(
            f"Generating {request.count} ad texts for {request.product_name} "
            f"on {request.platform.value}"
        )

        # Prepare user prompt
        user_content = (
            f"اسم المنتج: {request.product_name}\n"
            f"وصف المنتج: {request.product_description}\n"
            f"المنصة: {request.platform.value}\n"
            f"النبرة: {request.tone.value}\n"
            f"الجمهور المستهدف: {request.target_audience}\n"
            f"اللغة: {request.language.value}\n"
            f"عدد النصوص: {request.count}\n\n"
            f"يرجى توليد {request.count} نصوص إعلانية متنوعة."
        )

        try:
            response_text, metadata = await llm_client.chat(
                system_prompt=self._system_prompt_text or
                "أنت خبير في كتابة الإعلانات التسويقية بالعربية.",
                user_prompt=user_content,
                temperature=settings.LLM_TEMPERATURE_GENERATION,
                model=settings.OPENAI_GENERATION_MODEL,
            )

            # Parse response
            result = parse_llm_response_to_model(
                response_text,
                AdTextResponse,
                fallback={
                    "texts": [
                        AdTextItem(
                            headline=f"اكتشف {request.product_name} اليوم!",
                            primary_text=f"جرب {request.product_name} المذهل. "
                                         f"{request.product_description[:100]}...",
                            cta="تسوق الآن",
                            hashtags=[f"#{request.product_name.replace(' ', '')}",
                                      "#تسوق", "#عرض"],
                        )
                    ]
                },
            )

            logger.info(
                f"Generated {len(result.texts)} ad texts in "
                f"{int((time.time() - start_time) * 1000)}ms"
            )
            return result

        except Exception as e:
            logger.error(f"Failed to generate ad text: {e}")
            raise

    async def generate_image_prompt(self, request: ImagePromptRequest) -> ImagePromptResponse:
        """
        Generate image prompts for ad creatives.

        توليد أوصاف للصور الإعلانية
        """
        start_time = time.time()

        prompt_text = (
            f"قم بتوليد 3 أوصاف لصور إعلانية للمنتج التالي:\n"
            f"اسم المنتج: {request.product_name}\n"
            f"فئة المنتج: {request.product_category}\n"
            f"الأسلوب: {request.style}\n"
            f"المنصة: {request.platform.value}\n\n"
            f"أعد النتيجة بصيغة JSON مع الحقول: title, description, prompt_ar, prompt_en, style_notes"
        )

        response_text, metadata = await llm_client.chat(
            system_prompt="أنت خبير في إنشاء الصور الإعلانية وإعطاء أوصاف دقيقة للصور.",
            user_prompt=prompt_text,
            temperature=0.8,
            model=settings.OPENAI_GENERATION_MODEL,
        )

        data = extract_json_from_llm_response(response_text)
        prompts_data = data.get("prompts", []) if data else []

        prompts = []
        for p in prompts_data[:3]:
            prompts.append(ImagePromptItem(
                title=p.get("title", f"صورة {request.product_name}"),
                description=p.get("description", ""),
                prompt_ar=p.get("prompt_ar", ""),
                prompt_en=p.get("prompt_en", ""),
                style_notes=p.get("style_notes", ""),
            ))

        if not prompts:
            prompts.append(ImagePromptItem(
                title=f"صورة رئيسية لـ {request.product_name}",
                description=f"صورة احترافية لـ {request.product_name} بنمط {request.style}",
                prompt_ar=f"صورة احترافية عالية الجودة لـ {request.product_name}، "
                         f"خلفية نظيفة، إضاءة مثالية، أسلوب {request.style}",
                prompt_en=f"Professional high-quality photo of {request.product_name}, "
                         f"clean background, perfect lighting, {request.style} style",
                style_notes=f"نمط {request.style} مناسب لمنصة {request.platform.value}",
            ))

        return ImagePromptResponse(prompts=prompts)

    async def generate_video_script(self, request: VideoScriptRequest) -> VideoScriptResponse:
        """
        Generate video ad scripts.

        توليد سكريبتات فيديو إعلانية
        """
        prompt_text = (
            f"قم بتوليد 2 سكريبت فيديو إعلاني للمنتج التالي:\n"
            f"المنتج: {request.product_name}\n"
            f"المدة: {request.duration_seconds} ثانية\n"
            f"المنصة: {request.platform.value}\n"
            f"النبرة: {request.tone.value}\n\n"
            f"أعد النتيجة بصيغة JSON مع الحقول: hook, body, call_to_action, visual_notes, duration_seconds"
        )

        response_text, metadata = await llm_client.chat(
            system_prompt="أنت مخرج إعلانات ومتخصص في سكريبتات الفيديو التسويقية.",
            user_prompt=prompt_text,
            temperature=0.8,
            model=settings.OPENAI_GENERATION_MODEL,
        )

        data = extract_json_from_llm_response(response_text)
        scripts_data = data.get("scripts", []) if data else []

        scripts = []
        for s in scripts_data[:2]:
            scripts.append(VideoScriptItem(
                hook=s.get("hook", "هل تبحث عن ...؟"),
                body=s.get("body", ""),
                call_to_action=s.get("call_to_action", "اشترك الآن"),
                visual_notes=s.get("visual_notes", ""),
                duration_seconds=s.get("duration_seconds", request.duration_seconds),
            ))

        if not scripts:
            scripts.append(VideoScriptItem(
                hook=f"هل تعلم أن {request.product_name} سيغير حياتك؟",
                body=f"في هذا الفيديو، سنكتشف سوياً كيف يمكن لـ {request.product_name} "
                     f"أن يحل مشاكلك. تابع معنا.",
                call_to_action="اطلب الآن واحصل على خصم خاص!",
                visual_notes="مقدمة سريعة، عرض المنتج من زوايا مختلفة، شهادات العملاء",
                duration_seconds=request.duration_seconds,
            ))

        return VideoScriptResponse(scripts=scripts)

    async def generate_hashtags(self, request: HashtagRequest) -> HashtagResponse:
        """
        Generate relevant hashtags for ad campaigns.

        توليد هاشتاجات للحملات الإعلانية
        """
        prompt_text = (
            f"قم بتوليد {request.count} هاشتاج مناسب للمنتج التالي:\n"
            f"اسم المنتج: {request.product_name}\n"
            f"فئة المنتج: {request.product_category}\n"
            f"المنصة: {request.platform.value}\n\n"
            f"صنف الهاشتاجات إلى: عامة، متخصصة، خاصة بالعلامة التجارية\n"
            f"أعد النتيجة بصيغة JSON"
        )

        response_text, metadata = await llm_client.chat(
            system_prompt="أنت خبير في تحسين ظهور المحتوى باستخدام الهاشتاجات.",
            user_prompt=prompt_text,
            temperature=0.6,
        )

        data = extract_json_from_llm_response(response_text)
        if not data:
            return HashtagResponse(
                hashtags=[
                    f"#{request.product_name.replace(' ', '')}",
                    f"#{request.product_category.replace(' ', '')}",
                    "#تسوق_اونلاين",
                    "#عرض_خاص",
                    "#تخفيضات",
                ]
            )

        # Combined hashtag list
        all_tags = data.get("hashtags", [])
        if isinstance(all_tags, list):
            all_tags = [t.strip("#") if t.startswith("#") else t for t in all_tags]
            all_tags = [f"#{t}" for t in all_tags]

        return HashtagResponse(
            hashtags=all_tags[: request.count],
            categories=data.get("categories"),
        )
