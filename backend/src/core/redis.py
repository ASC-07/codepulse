import redis.asyncio as aioredis
from loguru import logger
from src.core.config import settings

redis_client: aioredis.Redis = None

async def connect_redis():
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        await redis_client.ping()
        logger.success("Connected to Redis")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        raise

async def disconnect_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis disconnected")

def get_redis():
    return redis_client