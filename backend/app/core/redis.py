"""Redis client — optional, graceful fallback when REDIS_URL is not configured."""

import redis.asyncio as aioredis
from app.core.config import settings

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis | None:
    """Return the Redis client, or None if not configured."""
    global _redis
    if not settings.redis_url:
        return None
    if _redis is None:
        _redis = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=3,
        )
    return _redis


async def close_redis():
    """Close Redis connection gracefully."""
    global _redis
    if _redis:
        await _redis.close()
        _redis = None


async def cache_set(key: str, value: str, ttl: int = 300) -> bool:
    """Set a cache key with TTL in seconds. Returns True if set."""
    r = await get_redis()
    if not r:
        return False
    await r.setex(key, ttl, value)
    return True


async def cache_get(key: str) -> str | None:
    """Get a cached value by key. Returns None if not found or Redis unavailable."""
    r = await get_redis()
    if not r:
        return None
    return await r.get(key)


async def cache_delete(key: str) -> bool:
    """Delete a cache key. Returns True if deleted."""
    r = await get_redis()
    if not r:
        return False
    await r.delete(key)
    return True
