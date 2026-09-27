import asyncio
from typing import AsyncGenerator, List
from app.ai.providers.base import BaseAIProvider, Message, AIResponseChunk

class MockKyroProvider(BaseAIProvider):
    def __init__(self):
        super().__init__(name="kyro_simulator")

    async def is_available(self) -> bool:
        return True

    async def generate(self, messages: List[Message], **kwargs) -> str:
        last_msg = messages[-1].content if messages else "Hello"
        return (
            f"Hello! I am Kyro, your autonomous AI desktop agent. "
            f"I received your query: '{last_msg}'. "
            f"My full multi-provider AI pipeline is operational. "
            f"You can connect Ollama locally or configure cloud LLM keys in .env."
        )

    async def stream(self, messages: List[Message], **kwargs) -> AsyncGenerator[AIResponseChunk, None]:
        last_msg = messages[-1].content if messages else "Hello"
        reply = (
            f"I am **Kyro**, your personal AI desktop agent.\n\n"
            f"I received your query: *\"{last_msg}\"*.\n\n"
            f"• **AI Layer**: Active (Streaming WebSocket & REST connected)\n"
            f"• **Capabilities**: Task Planning, Browser Control (Playwright), Realtime Voice (in Phase 4-5)\n"
            f"• **Provider**: Kyro Fast Engine (Ready for Ollama & Cloud models)"
        )
        words = reply.split(" ")
        for i, word in enumerate(words):
            await asyncio.sleep(0.035)
            yield AIResponseChunk(
                content=word + (" " if i < len(words) - 1 else ""),
                done=False,
                model="kyro-v1",
                provider=self.name,
            )
        yield AIResponseChunk(content="", done=True, model="kyro-v1", provider=self.name)
