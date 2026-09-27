import httpx
import json
import asyncio
from typing import AsyncGenerator, List, Optional
from app.ai.providers.base import BaseAIProvider, Message, AIResponseChunk
from app.core.config import settings
from app.core.logging import logger

class CloudProvider(BaseAIProvider):
    def __init__(self, provider_type: str = "openai", api_key: Optional[str] = None, model: Optional[str] = None):
        super().__init__(name=f"cloud_{provider_type}")
        self.provider_type = provider_type
        self.api_key = api_key or getattr(settings, f"{provider_type}_api_key", None)
        self.model = model or ("gpt-4o-mini" if provider_type == "openai" else "gemini-1.5-flash")

    async def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate(self, messages: List[Message], **kwargs) -> str:
        if not await self.is_available():
            return (
                f"[Cloud Provider: {self.provider_type}] No API key configured. "
                f"Please add {self.provider_type.upper()}_API_KEY to your .env file or use Local Ollama."
            )

        # Standard OpenAI-compatible format
        if self.provider_type in ["openai", "groq", "together"]:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "messages": [{"role": m.role, "content": m.content} for m in messages],
                "stream": False,
            }
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                return data["choices"][0]["message"]["content"]
        return "Unsupported cloud provider type"

    async def stream(self, messages: List[Message], **kwargs) -> AsyncGenerator[AIResponseChunk, None]:
        if not await self.is_available():
            fallback_text = (
                f"Kyro Cloud Provider ({self.provider_type}) requires an API key in your .env file. "
                "Switch to Local Ollama in the top dropdown or add your key."
            )
            for word in fallback_text.split(" "):
                await asyncio.sleep(0.04)
                yield AIResponseChunk(content=word + " ", done=False, model=self.model, provider=self.name)
            yield AIResponseChunk(content="", done=True, model=self.model, provider=self.name)
            return

        # OpenAI streaming implementation
        if self.provider_type in ["openai", "groq"]:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "messages": [{"role": m.role, "content": m.content} for m in messages],
                "stream": True,
            }
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            yield AIResponseChunk(content="", done=True, model=self.model, provider=self.name)
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield AIResponseChunk(content=delta, done=False, model=self.model, provider=self.name)
                        except Exception as e:
                            logger.debug(f"Error parsing stream delta: {e}")
