from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from loguru import logger
from src.core.config import settings
from src.core.redis import get_redis

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"Token verification failed: {e}")
        return None

async def store_refresh_token(user_id: str, refresh_token: str):
    redis = get_redis()
    await redis.setex(
        f"refresh_token:{user_id}",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        refresh_token
    )

async def invalidate_refresh_token(user_id: str):
    redis = get_redis()
    await redis.delete(f"refresh_token:{user_id}")

async def is_refresh_token_valid(user_id: str, refresh_token: str) -> bool:
    redis = get_redis()
    stored = await redis.get(f"refresh_token:{user_id}")
    return stored == refresh_token