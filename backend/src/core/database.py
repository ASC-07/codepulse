from motor.motor_asyncio import AsyncIOMotorClient
from loguru import logger
from src.core.config import settings

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        await client.admin.command("ping")
        logger.success(f"Connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        raise

async def disconnect_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB disconnected")

def get_db():
    return db