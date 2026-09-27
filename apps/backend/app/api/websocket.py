from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
from app.ai.router import ai_router
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
        # Initial handshake
        await websocket.send_text(json.dumps({
            "type": "connection_ack",
            "message": "Connected to Kyro Realtime AI Engine",
            "status": "connected"
        }))
        
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            event_type = data.get("type", "chat")

            if event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "timestamp": data.get("timestamp")}))
                continue

            if event_type == "chat_stream":
                messages = data.get("messages", [])
                provider = data.get("provider", None)
                system_prompt = data.get("system_prompt", None)

                try:
                    async for chunk in ai_router.stream_chat(
                        messages=messages,
                        provider_name=provider,
                        system_prompt=system_prompt,
                    ):
                        await websocket.send_text(json.dumps({
                            "type": "chat_chunk",
                            "content": chunk.content,
                            "done": chunk.done,
                            "provider": chunk.provider,
                            "model": chunk.model,
                        }))
                except Exception as stream_err:
                    logger.error(f"WebSocket stream error: {stream_err}")
                    await websocket.send_text(json.dumps({
                        "type": "chat_chunk",
                        "error": str(stream_err),
                        "done": True,
                    }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket exception: {e}")
        manager.disconnect(websocket)
