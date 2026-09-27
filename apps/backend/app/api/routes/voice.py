from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/voice", tags=["voice"])

class VoiceStatus(BaseModel):
    is_listening: bool
    is_speaking: bool
    stt_provider: str
    tts_provider: str

@router.get("/status")
async def voice_status():
    return {
        "status": "idle",
        "stt_engine": "ready",
        "tts_engine": "ready",
        "wake_word": "Hey Kyro",
    }
