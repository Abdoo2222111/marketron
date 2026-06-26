"""
Unified LLM Client with OpenAI/Anthropic fallback support.
عميل موحد مع دعم التبديل التلقائي بين مقدمي الخدمة
"""
from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from src.config import settings

logger = logging.getLogger(__name__)


class LLMClientError(Exception):
    """Base exception for LLM client errors."""
    pass


class LLMClient:
    """
    Unified LLM client that supports OpenAI and Anthropic with automatic fallback.

    الأولوية: OpenAI → Anthropic (إذا فشل الأول)
    """

    def __init__(self):
        self._openai_client = None
        self._anthropic_client = None
        self._current_provider = None
        self._initialized = False

    async def _ensure_openai(self):
        """Lazy-init OpenAI client."""
        if self._openai_client is None and settings.OPENAI_API_KEY:
            try:
                from openai import AsyncOpenAI
                self._openai_client = AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    timeout=settings.LLM_TIMEOUT,
                )
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
                self._openai_client = None

    async def _ensure_anthropic(self):
        """Lazy-init Anthropic client."""
        if self._anthropic_client is None and settings.ANTHROPIC_API_KEY:
            try:
                from anthropic import AsyncAnthropic
                self._anthropic_client = AsyncAnthropic(
                    api_key=settings.ANTHROPIC_API_KEY,
                    timeout=settings.LLM_TIMEOUT,
                )
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")
                self._anthropic_client = None

    async def initialize(self):
        """Initialize all configured clients."""
        await self._ensure_openai()
        await self._ensure_anthropic()
        self._initialized = True

    @property
    def is_ready(self) -> bool:
        return self._openai_client is not None or self._anthropic_client is not None

    def _count_tokens_approx(self, text: str) -> int:
        """Approximate token count (~4 chars per token for Arabic/English mix)."""
        return len(text) // 4 + 1

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(
            (LLMClientError, ConnectionError, TimeoutError)
        ),
        reraise=True,
    )
    async def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None,
        prefer_provider: Optional[str] = None,
        structured_output: Optional[type] = None,
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Send a chat completion request with automatic fallback.

        Args:
            system_prompt: System instructions
            user_prompt: User message
            temperature: Controls randomness (0.0-1.0)
            max_tokens: Maximum output tokens
            model: Specific model to use (overrides defaults)
            prefer_provider: 'openai' or 'anthropic'
            structured_output: Pydantic model class for structured output

        Returns:
            Tuple of (response_text, metadata_dict)
        """
        start_time = time.time()
        metadata: Dict[str, Any] = {
            "provider": None,
            "model": None,
            "tokens_input": 0,
            "tokens_output": 0,
            "latency_ms": 0,
            "fallback_used": False,
        }

        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE_CHAT
        max_out = max_tokens or settings.MAX_OUTPUT_TOKENS
        metadata["tokens_input"] = self._count_tokens_approx(
            system_prompt + user_prompt
        )

        # Determine provider order
        providers = ["openai", "anthropic"]
        if prefer_provider and prefer_provider in providers:
            providers.remove(prefer_provider)
            providers.insert(0, prefer_provider)

        errors = []
        for provider in providers:
            try:
                if provider == "openai" and self._openai_client:
                    model_name = model or settings.OPENAI_CHAT_MODEL
                    response = await self._openai_client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        temperature=temp,
                        max_tokens=max_out,
                    )
                    result = response.choices[0].message.content
                    metadata["provider"] = "openai"
                    metadata["model"] = model_name
                    metadata["tokens_output"] = self._count_tokens_approx(result)
                    metadata["latency_ms"] = int((time.time() - start_time) * 1000)
                    return result, metadata

                elif provider == "anthropic" and self._anthropic_client:
                    model_name = model or settings.ANTHROPIC_CHAT_MODEL
                    response = await self._anthropic_client.messages.create(
                        model=model_name,
                        system=system_prompt,
                        messages=[{"role": "user", "content": user_prompt}],
                        temperature=temp,
                        max_tokens=max_out,
                    )
                    result = response.content[0].text
                    metadata["provider"] = "anthropic"
                    metadata["model"] = model_name
                    metadata["tokens_output"] = self._count_tokens_approx(result)
                    metadata["latency_ms"] = int((time.time() - start_time) * 1000)
                    return result, metadata

            except Exception as e:
                logger.warning(
                    f"Provider '{provider}' failed: {e}"
                )
                errors.append(f"{provider}: {str(e)}")
                metadata["fallback_used"] = True
                continue

        # All providers failed
        error_msg = f"All LLM providers failed: {'; '.join(errors)}" if errors else "No LLM providers configured"
        logger.error(error_msg)
        raise LLMClientError(error_msg)

    async def chat_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream a chat completion response."""
        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE_CHAT
        max_out = max_tokens or settings.MAX_OUTPUT_TOKENS

        try:
            await self._ensure_openai()
            if self._openai_client:
                stream = await self._openai_client.chat.completions.create(
                    model=settings.OPENAI_CHAT_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temp,
                    max_tokens=max_out,
                    stream=True,
                )
                async for chunk in stream:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        yield content
                return
        except Exception as e:
            logger.warning(f"OpenAI stream failed, trying Anthropic: {e}")

        try:
            await self._ensure_anthropic()
            if self._anthropic_client:
                async with self._anthropic_client.messages.create(
                    model=settings.ANTHROPIC_CHAT_MODEL,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                    temperature=temp,
                    max_tokens=max_out,
                    stream=True,
                ) as stream:
                    async for chunk in stream:
                        if hasattr(chunk, 'delta') and chunk.delta and chunk.delta.text:
                            yield chunk.delta.text
        except Exception as e:
            logger.error(f"All streaming providers failed: {e}")
            raise LLMClientError(f"Streaming failed: {e}")


# Global client instance
llm_client = LLMClient()
