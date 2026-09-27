from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    provider: Optional[str] = "ollama"

@router.post("/send")
async def send_message(request: ChatRequest):
    return {
        "reply": f"Kyro received: '{request.message}'. (Phase 1 Stub - Full AI layer coming in Phase 2)",
        "conversation_id": request.conversation_id or "default-session",
        "status": "success",
    }
