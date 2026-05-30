from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    MONGODB_URL: str
    DATABASE_NAME: str = "codepulse"

    REDIS_URL: str = "redis://localhost:6379"

    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_WEBHOOK_SECRET: str
    GITHUB_CALLBACK_URL: str

    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"

    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()