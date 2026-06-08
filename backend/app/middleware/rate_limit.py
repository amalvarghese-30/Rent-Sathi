from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.config import settings

if settings.redis_url:
    limiter = Limiter(
        key_func=get_remote_address,
        storage_uri=settings.redis_url,
        default_limits=["100/minute"],
    )
else:
    limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


# Rate limit presets for auth endpoints
LOGIN_LIMIT = "5/minute"
REGISTER_LIMIT = "3/minute"
FORGOT_PASSWORD_LIMIT = "3/hour"
UPLOAD_LIMIT = "10/minute"
