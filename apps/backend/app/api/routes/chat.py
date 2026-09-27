from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from app.ai.router import ai_router
from app.core.logging import logger

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessagePayload(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[ChatMessagePayload]] = None
    conversation_id: Optional[str] = None
    provider: Optional[str] = None
    system_prompt: Optional[str] = None

@router.get("/providers")
async def get_providers():
    """List all AI providers (Ollama local, Cloud, Fallback) and their live availability."""
    providers = await ai_router.list_available_providers()
    return {"providers": providers}

@router.post("/send")
async def send_message(request: ChatRequest):
    """Generate a single complete response from the AI router."""
    msgs = []
    if request.messages:
        msgs = [{"role": m.role, "content": m.content} for m in request.messages]
    elif request.message:
        msgs = [{"role": "user", "content": request.message}]
    else:
        raise HTTPException(status_code=400, detail="No message or messages array provided")

    provider = await ai_router.get_active_provider(request.provider)
    prepared = ai_router.prepare_messages(msgs, request.system_prompt)
    
    reply = await provider.generate(prepared)
    return {
        "reply": reply,
        "provider": provider.name,
        "conversation_id": request.conversation_id or "default-session",
        "status": "success",
    }

@router.post("/stream")
async def stream_message(request: ChatRequest):
    """Stream token chunks in real-time as Server-Sent Events (SSE)."""
    msgs = []
    if request.messages:
        msgs = [{"role": m.role, "content": m.content} for m in request.messages]
    elif request.message:
        msgs = [{"role": "user", "content": request.message}]
    else:
        raise HTTPException(status_code=400, detail="No message provided")

    async def event_generator():
        try:
            async for chunk in ai_router.stream_chat(
                messages=msgs,
                provider_name=request.provider,
                system_prompt=request.system_prompt,
            ):
                payload = json.dumps(chunk.model_dump())
                yield f"data: {payload}\n\n"
        except Exception as e:
            logger.error(f"Error in chat stream generator: {e}")
            err_payload = json.dumps({"error": str(e), "done": True})
            yield f"data: {err_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
