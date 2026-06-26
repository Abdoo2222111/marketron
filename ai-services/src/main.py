"""
FastAPI Application Main Entry Point.

منصة التسويق الإلكتروني - خدمات الذكاء الاصطناعي
Marketing Platform AI Services 🚀
"""
from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

import structlog
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from src.config import settings
from src.middleware.auth import get_current_user, security
from src.middleware.logging import LoggingMiddleware, TimingMiddleware
from src.utils.llm_client import llm_client

# Configure structlog
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# ──────────────────────────────────────────
# Lifespan (Startup/Shutdown)
# ──────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")

    # Initialize LLM clients
    await llm_client.initialize()
    if llm_client.is_ready:
        logger.info("✅ LLM clients initialized")
    else:
        logger.warning("⚠️ No LLM clients available. Check API keys.")

    yield

    # Shutdown
    logger.info("👋 AI Services shutting down...")


# ──────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "🧠 خدمات الذكاء الاصطناعي لمنصة التسويق الإلكتروني\n\n"
        "## المكونات\n"
        "### 1️⃣ Content Generation - توليد المحتوى\n"
        "نصوص إعلانية، أوصاف صور، سكريبتات فيديو، هاشتاجات\n\n"
        "### 2️⃣ Campaign Analysis - تحليل الحملات\n"
        "تحليل الأداء، توقع النتائج\n\n"
        "### 3️⃣ Competitor Analysis - تحليل المنافسين\n"
        "تحليل منافس فردي، مقارنة منافسين\n\n"
        "### 4️⃣ Market Research - أبحاث السوق\n"
        "تحليل السوق، تشخيص مشاكل المبيعات (ليه مش ببيع؟)\n\n"
        "### 5️⃣ Recommendation Engine - محرك التوصيات\n"
        "الميزانية، الاستهداف، التوقيت\n\n"
        "### 6️⃣ Arabic NLP - معالجة اللغة العربية\n"
        "تحليل المشاعر، استخراج الكلمات المفتاحية، محتوى SEO"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(TimingMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ──────────────────────────────────────────
# Health & Info
# ──────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "llm_ready": llm_client.is_ready,
        "timestamp": time.time(),
    }


@app.get("/", tags=["System"])
async def root():
    """Root endpoint with service info."""
    return {
        "message": f"🧠 {settings.APP_NAME} v{settings.APP_VERSION}",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/api/ai/info", tags=["System"])
async def ai_info():
    """AI services configuration info."""
    return {
        "configured_providers": [
            p for p, k in [
                ("openai", settings.OPENAI_API_KEY),
                ("anthropic", settings.ANTHROPIC_API_KEY),
            ] if k
        ],
        "chat_model": settings.OPENAI_CHAT_MODEL,
        "generation_model": settings.OPENAI_GENERATION_MODEL,
        "fallback_enabled": settings.LLM_FALLBACK_ENABLED,
        "rate_limit_per_minute": settings.RATE_LIMIT_PER_USER,
    }


# ──────────────────────────────────────────
# Register Routers
# ──────────────────────────────────────────
def register_routers():
    """Register all API routers."""
    from src.routes.content_routes import router as content_router
    from src.routes.analysis_routes import router as analysis_router
    from src.routes.market_routes import router as market_router
    from src.routes.recommendation_routes import router as recommendation_router
    from src.routes.nlp_routes import router as nlp_router

    app.include_router(content_router, prefix="/api/ai", tags=["1️⃣ Content Generation"])
    app.include_router(analysis_router, prefix="/api/ai", tags=["2️⃣ Campaign Analysis"])
    app.include_router(market_router, prefix="/api/ai", tags=["3️⃣ Competitor Analysis", "4️⃣ Market Research"])
    app.include_router(recommendation_router, prefix="/api/ai", tags=["5️⃣ Recommendation Engine"])
    app.include_router(nlp_router, prefix="/api/ai", tags=["6️⃣ Arabic NLP"])

    logger.info("✅ All API routers registered")


register_routers()


# ──────────────────────────────────────────
# Exception Handlers
# ──────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": time.time(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler."""
    logger.error(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "حدث خطأ داخلي في الخادم. الرجاء المحاولة لاحقاً.",
            "timestamp": time.time(),
        },
    )
