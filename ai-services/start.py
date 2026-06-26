# Application Index File (Python)
// ============================================================

from src.config import settings
from src.utils.llm_client import llm_client
from src.main import app

// ============================================================
// Application Startup
// ============================================================

import asyncio

async def startup():
    """Initialize application on startup."""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"🌐 Running on http://0.0.0.0:{settings.SERVICE_PORT}")
    print(f"📚 API Docs: http://0.0.0.0:{settings.SERVICE_PORT}/docs")

    # Initialize LLM clients
    await llm_client.initialize()
    if llm_client.is_ready:
        print("✅ LLM clients initialized")
    else:
        print("⚠️ No LLM clients available. Check API keys.")

if __name__ == "__main__":
    import uvicorn

    # Initialize
    asyncio.run(startup())

    # Start server
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=settings.DEBUG,
    )
