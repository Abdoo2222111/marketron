"""
Logging, timing, and monitoring middleware for AI Services.
"""
from __future__ import annotations

import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for request/response logging with timing and token tracking.
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Log incoming request
        logger.info(
            f"→ {request.method} {request.url.path} "
            f"[client: {request.client.host if request.client else 'unknown'}]"
        )

        try:
            response = await call_next(request)

            # Calculate processing time
            process_time = int((time.time() - start_time) * 1000)

            # Log response
            logger.info(
                f"← {request.method} {request.url.path} "
                f"→ {response.status_code} ({process_time}ms)"
            )

            # Add processing time header
            response.headers["X-Processing-Time-Ms"] = str(process_time)

            return response

        except Exception as e:
            process_time = int((time.time() - start_time) * 1000)
            logger.error(
                f"✗ {request.method} {request.url.path} "
                f"FAILED after {process_time}ms: {str(e)}"
            )
            raise


class TimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to track request timing and token usage.
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        response = await call_next(request)

        elapsed = int((time.time() - start_time) * 1000)
        response.headers["X-Process-Time"] = str(elapsed)

        return response
