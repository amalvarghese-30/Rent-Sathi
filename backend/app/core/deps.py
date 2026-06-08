from datetime import datetime
from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
from ..core.config import settings
from ..core.security import decode_token
from ..models.user import User

security_scheme = HTTPBearer(auto_error=False)

_db: Optional[AsyncIOMotorDatabase] = None


async def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        client = AsyncIOMotorClient(settings.mongodb_url)
        _db = client[settings.database_name]
    return _db


async def init_models():
    db = await get_db()
    await init_beanie(
        database=db,
        document_models=[
            User,
        ],
    )


async def get_token_from_request(request: Request) -> Optional[str]:
    # Try Authorization header first
    auth: Optional[HTTPAuthorizationCredentials] = await security_scheme(request)
    if auth:
        return auth.credentials

    # Try cookie
    token = request.cookies.get("access_token")
    if token:
        return token

    return None


async def get_current_user(request: Request) -> User:
    token = await get_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Reject tokens issued before explicit invalidation (logout)
    if user.token_invalidated_at:
        iat = payload.get("iat")
        if iat:
            token_issued = datetime.utcfromtimestamp(iat)
            if token_issued < user.token_invalidated_at:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked",
                )

    return user


async def get_current_verified_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified",
        )
    return current_user


async def get_current_broker(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "broker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Broker access required",
        )
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
