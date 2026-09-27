from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.tts.service import tts_service

router = APIRouter(prefix="/voice", tags=["voice"])

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to synthesize into speech")
    voice: Optional[str] = Field("en-US-JennyNeural", description="Voice ID to use for speech generation")

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
        "tts_engine": "neural_edge_tts",
        "wake_word": "Hey Kyro",
    }

@router.get("/voices")
async def get_available_voices():
    """Get all free high-definition AI voice models."""
    voices = await tts_service.get_voices()
    return {"voices": voices}

@router.post("/tts")
async def synthesize_speech(req: TTSRequest):
    """Synthesizes text into crystal-clear neural MP3 audio."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    audio_bytes = await tts_service.synthesize(req.text, req.voice or "en-US-JennyNeural")
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="Failed to synthesize speech audio")

    return Response(content=audio_bytes, media_type="audio/mpeg")

