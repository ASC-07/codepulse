from fastapi import WebSocket
from typing import Dict, List
from loguru import logger
import json

class ConnectionManager:
    """
    Manages WebSocket connections per user.
    Each user gets their own list of connections
    (they could have multiple browser tabs open).
    """
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected: user {user_id} ({len(self.active_connections[user_id])} connections)")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected: user {user_id}")

    async def send_to_user(self, user_id: str, event: str, data: dict):
        """Send a real-time event to all tabs of a specific user"""
        if user_id not in self.active_connections:
            return
        message = json.dumps({"event": event, "data": data})
        dead = []
        for ws in self.active_connections[user_id]:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active_connections[user_id].remove(ws)

    async def broadcast(self, event: str, data: dict):
        """Send event to ALL connected users"""
        message = json.dumps({"event": event, "data": data})
        for user_id, connections in self.active_connections.items():
            for ws in connections:
                try:
                    await ws.send_text(message)
                except Exception:
                    pass

# Global singleton — one manager for the whole app
manager = ConnectionManager()