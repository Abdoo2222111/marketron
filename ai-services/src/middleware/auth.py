"""
JWT Authentication Middleware.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

from src.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


async def verify_jwt_token(
    credentials: Optional[HTTPAuthorizationCredentials] = None,
) -> dict:
    """
    Verify JWT token and extract user information.

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        User payload from JWT

    Raises:
        HTTPException: If token is invalid or expired
    """
    if not credentials:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="❌ يلزم تسجيل الدخول. التوكن مفقود",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="❌ التوكن غير صالح: لا يحتوي على معرف المستخدم",
            )
        return payload

    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=f"❌ التوكن غير صالح أو منتهي الصلاحية: {str(e)}",
        )


async def get_current_user(request: Request) -> dict:
    """
    Extract and verify user from request.
    Used as FastAPI dependency.

    Args:
        request: FastAPI request object

    Returns:
        User payload dict with user_id, role, etc.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="❌ يلزم تسجيل الدخول",
        )

    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="❌ صيغة التوكن غير صحيحة. استخدم: Bearer <token>",
        )

    from fastapi.security.http import HTTPAuthorizationCredentials
    credentials = HTTPAuthorizationCredentials(scheme=scheme, credentials=token)
    return await verify_jwt_token(credentials)
