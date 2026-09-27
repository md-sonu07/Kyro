import io
import httpx
from typing import List, Dict, Any, Optional
import edge_tts
from app.core.logging import logger

AVAILABLE_VOICES: List[Dict[str, Any]] = [
    {
        "id": "en-US-JennyNeural",
        "name": "Jenny (Studio AI)",
        "gender": "Female",
        "language": "en-US",
        "accent": "US",
        "description": "Warm, natural, crystal clear conversational tone",
        "isDefault": True,
    },
    {
        "id": "en-US-GuyNeural",
        "name": "Guy (Studio AI)",
        "gender": "Male",
        "language": "en-US",
        "accent": "US",
        "description": "Deep, confident, friendly voice",
    },
    {
        "id": "en-US-AriaNeural",
        "name": "Aria (Expressive)",
        "gender": "Female",
        "language": "en-US",
        "accent": "US",
        "description": "Polished, professional, expressive delivery",
    },
    {
        "id": "en-US-ChristopherNeural",
        "name": "Christopher (Smooth)",
        "gender": "Male",
        "language": "en-US",
        "accent": "US",
        "description": "Smooth, relaxed, storyteller voice",
    },
    {
        "id": "en-GB-SoniaNeural",
        "name": "Sonia (British)",
        "gender": "Female",
        "language": "en-GB",
        "accent": "UK",
        "description": "Refined, articulate British accent",
    },
    {
        "id": "en-US-AnaNeural",
        "name": "Ana (Youthful)",
        "gender": "Female",
        "language": "en-US",
        "accent": "US",
        "description": "Friendly, energetic, clear voice",
    },
]

class TTSService:
    async def get_voices(self) -> List[Dict[str, Any]]:
        """Returns list of all available high-definition neural voices."""
        return AVAILABLE_VOICES

    async def synthesize(self, text: str, voice: str = "en-US-JennyNeural") -> bytes:
        """Synthesizes text into high-fidelity neural MP3 audio."""
        clean_text = text.strip()
        if not clean_text:
            return b""

        # 1. Edge-TTS Neural Synthesis
        try:
            communicate = edge_tts.Communicate(clean_text, voice)
            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])
            
            data = audio_buffer.getvalue()
            if data:
                return data
        except Exception as e:
            logger.error(f"Edge-TTS synthesis error: {e}")

        # 2. Fallback to Voicebox local server if active (http://localhost:17493)
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    "http://localhost:17493/api/tts",
                    json={"text": clean_text, "voice": voice},
                )
                if res.status_code == 200:
                    return res.content
        except Exception:
            pass

        return b""

tts_service = TTSService()
