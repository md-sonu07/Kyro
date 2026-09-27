from typing import Dict, List, Optional, AsyncGenerator, Any
from app.ai.providers.base import BaseAIProvider, Message, AIResponseChunk
from app.ai.providers.ollama import OllamaProvider
from app.ai.providers.cloud import CloudProvider
from app.ai.providers.mock import MockKyroProvider
from app.ai.prompts.system import KYRO_SYSTEM_PROMPT
from app.core.config import settings
from app.core.logging import logger

class AIRouter:
    def __init__(self):
        self.providers: Dict[str, BaseAIProvider] = {
            "ollama": OllamaProvider(),
            "openai": CloudProvider(provider_type="openai"),
            "mock": MockKyroProvider(),
        }
        self.default_provider = "ollama"

    async def get_active_provider(self, requested: Optional[str] = None) -> BaseAIProvider:
        """Find the best available provider based on request or availability."""
        if requested and requested in self.providers:
            provider = self.providers[requested]
            if await provider.is_available():
                return provider
            logger.info(f"Requested provider '{requested}' is not reachable. Falling back.")

        # Check local Ollama first
        ollama_p = self.providers["ollama"]
        if await ollama_p.is_available():
            return ollama_p

        # Check Cloud OpenAI
        openai_p = self.providers["openai"]
        if await openai_p.is_available():
            return openai_p

        # Fallback to Mock Kyro Provider for instant zero-config response
        return self.providers["mock"]

    async def list_available_providers(self) -> List[Dict[str, Any]]:
        result = []
        for name, provider in self.providers.items():
            avail = await provider.is_available()
            models = []
            if name == "ollama" and avail:
                models = await provider.list_models()
            result.append({
                "name": name,
                "available": avail,
                "models": models,
            })
        return result

    def prepare_messages(self, user_messages: List[Dict[str, str]], system_prompt: Optional[str] = None) -> List[Message]:
        msgs = [Message(role="system", content=system_prompt or KYRO_SYSTEM_PROMPT)]
        for m in user_messages:
            msgs.append(Message(role=m.get("role", "user"), content=m.get("content", "")))
        return msgs

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        provider_name: Optional[str] = None,
        system_prompt: Optional[str] = None,
    ) -> AsyncGenerator[AIResponseChunk, None]:
        provider = await self.get_active_provider(provider_name)
        prepared = self.prepare_messages(messages, system_prompt)
        logger.info(f"Routing chat stream to provider: {provider.name}")
        async for chunk in provider.stream(prepared):
            yield chunk

ai_router = AIRouter()
