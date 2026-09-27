import httpx
import json
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.ai.providers.base import BaseAIProvider, Message, AIResponseChunk
from app.core.config import settings
from app.core.logging import logger

class OllamaProvider(BaseAIProvider):
    def __init__(self, base_url: str = None, model: str = None):
        super().__init__(name="ollama")
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.model = model or settings.ollama_model

    async def is_available(self) -> bool:
        """Check if local Ollama server is running and responding."""
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[str]:
        """Fetch all installed models in local Ollama."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m.get("name") for m in data.get("models", [])]
        except Exception as e:
            logger.debug(f"Failed to list Ollama models: {e}")
        return []

    async def resolve_model(self, requested_model: Optional[str] = None) -> str:
        if requested_model:
            return requested_model
        models = await self.list_models()
        if self.model in models:
            return self.model
        if models:
            return models[0]
        return self.model

    async def generate(self, messages: List[Message], **kwargs) -> str:
        model_to_use = await self.resolve_model(kwargs.get("model"))
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model_to_use,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            return data.get("message", {}).get("content", "")

    async def stream(self, messages: List[Message], **kwargs) -> AsyncGenerator[AIResponseChunk, None]:
        model_to_use = await self.resolve_model(kwargs.get("model"))
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model_to_use,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        chunk_text = data.get("message", {}).get("content", "")
                        is_done = data.get("done", False)
                        yield AIResponseChunk(
                            content=chunk_text,
                            done=is_done,
                            model=model_to_use,
                            provider="ollama",
                        )
                        if is_done:
                            break
                    except Exception as e:
                        logger.warning(f"Error parsing Ollama stream chunk: {e}")
