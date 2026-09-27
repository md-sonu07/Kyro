from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
from app.core.logging import logger

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message over WebSocket: {e}")

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial connection acknowledgment
        await websocket.send_text(json.dumps({
            "type": "connection_ack",
            "message": "Connected to Kyro Realtime Agent Engine",
            "status": "connected"
        }))
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            logger.debug(f"Received WS message: {payload}")
            
            # Simple ping-pong / echo for Phase 1 verification
            event_type = payload.get("type", "message")
            if event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "timestamp": payload.get("timestamp")}))
            else:
                await websocket.send_text(json.dumps({
                    "type": "agent_stream_chunk",
                    "content": f"Kyro received event: {event_type}",
                    "raw": payload
                }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket exception: {e}")
        manager.disconnect(websocket)
