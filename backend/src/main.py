from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from src.core.config import settings
from src.core.database import connect_db, disconnect_db
from src.core.redis import connect_redis, disconnect_redis
from src.api.routes import auth, repos, reviews, analytics, webhooks
from src.sockets.manager import manager
from src.services.jwt_service import verify_token

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CodePulse API...")
    await connect_db()
    await connect_redis()
    logger.success("CodePulse API is ready")
    yield
    await disconnect_db()
    await disconnect_redis()
    logger.info("CodePulse API shut down")

app = FastAPI(
    title="CodePulse API",
    description="AI-powered GitHub PR Code Review Platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(repos.router,     prefix="/api/repos",     tags=["repos"])
app.include_router(reviews.router,   prefix="/api/reviews",   tags=["reviews"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(webhooks.router,  prefix="/api/webhooks",  tags=["webhooks"])

@app.get("/health")
async def health():
    return {"status": "ok", "app": "CodePulse", "env": settings.APP_ENV}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str = None):
    """
    WebSocket endpoint — frontend connects here on login.
    URL: ws://localhost:8000/ws/{user_id}?token=JWT_TOKEN
    """
    # Verify JWT token passed as query param
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    payload = verify_token(token)
    if not payload or payload.get("sub") != user_id:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user_id)
    try:
        # Send welcome message
        await manager.send_to_user(user_id, "connected", {
            "message": "Real-time connection established"
        })
        # Keep connection alive — listen for pings from client
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)