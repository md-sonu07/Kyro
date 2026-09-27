from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from pydantic import BaseModel

class Message(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str

class AIResponseChunk(BaseModel):
    content: str
    done: bool = False
    model: Optional[str] = None
    provider: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

class BaseAIProvider(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if the provider server/service is reachable and ready."""
        pass

    @abstractmethod
    async def generate(self, messages: List[Message], **kwargs) -> str:
        """Generate a complete non-streaming response."""
        pass

    @abstractmethod
    async def stream(self, messages: List[Message], **kwargs) -> AsyncGenerator[AIResponseChunk, None]:
        """Stream chunks in real-time as tokens arrive from the model."""
        pass
