import pytest
from app.ai.router import ai_router
from app.ai.providers.mock import MockKyroProvider
from app.ai.providers.base import Message

@pytest.mark.asyncio
async def test_ai_router_fallback():
    provider = await ai_router.get_active_provider("mock")
    assert provider.name == "kyro_simulator"
    
    messages = [Message(role="user", content="Hello Kyro")]
    reply = await provider.generate(messages)
    assert "Kyro" in reply

@pytest.mark.asyncio
async def test_ai_router_stream():
    chunks = []
    async for chunk in ai_router.stream_chat(
        messages=[{"role": "user", "content": "What is Kyro?"}],
        provider_name="mock"
    ):
        if chunk.content:
            chunks.append(chunk.content)
    
    full_text = "".join(chunks)
    assert len(full_text) > 0
    assert "Kyro" in full_text
