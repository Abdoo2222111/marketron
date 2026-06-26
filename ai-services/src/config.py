"""
AI Services Configuration
مركز الإعدادات لخدمات الذكاء الاصطناعي
"""
from __future__ import annotations

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App info
    APP_NAME: str = "Marketing AI Services"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # OpenAI
    OPENAI_API_KEY: Optional[str] = Field(None, alias="OPENAI_API_KEY")
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    OPENAI_GENERATION_MODEL: str = "gpt-4o"

    # Anthropic
    ANTHROPIC_API_KEY: Optional[str] = Field(None, alias="ANTHROPIC_API_KEY")
    ANTHROPIC_CHAT_MODEL: str = "claude-3-5-sonnet-20241022"

    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False
    CACHE_TTL: int = 3600

    # JWT
    JWT_SECRET_KEY: str = "your-jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"

    # Rate Limiting
    RATE_LIMIT_PER_USER: int = 100
    RATE_LIMIT_WINDOW: int = 60

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # OpenTelemetry
    OTEL_ENABLED: bool = False
    OTEL_SERVICE_NAME: str = "marketing-ai-services"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://localhost:4317"

    # HuggingFace
    HF_TOKEN: Optional[str] = None
    USE_LOCAL_MODELS: bool = False

    # LLM Configuration
    LLM_TIMEOUT: int = 60
    LLM_MAX_RETRIES: int = 3
    LLM_FALLBACK_ENABLED: bool = True  # OpenAI → Anthropic fallback
    LLM_TEMPERATURE_CHAT: float = 0.3  # Lower for analysis
    LLM_TEMPERATURE_GENERATION: float = 0.7  # Higher for creative

    # Token limits
    MAX_INPUT_TOKENS: int = 128000
    MAX_OUTPUT_TOKENS: int = 4096

    # Service Configuration
    SERVICE_PORT: int = 8000
    WORKER_THREADS: int = 4
    MAX_REQUEST_SIZE: int = 10485760

    # Monitoring
    PROMETHEUS_ENABLED: bool = False
    OTEL_ENABLED: bool = False

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()

# Validate critical settings on import
if not settings.OPENAI_API_KEY and not settings.ANTHROPIC_API_KEY:
    import warnings
    warnings.warn(
        "⚠️ No API keys configured! Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env"
    )
