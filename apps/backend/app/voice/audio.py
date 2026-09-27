import asyncio
from typing import Optional, Callable
from app.core.logging import logger

class AudioStreamConfig:
    def __init__(
        self,
        sample_rate: int = 16000,
        chunk_size: int = 1280,
        channels: int = 1,
    ):
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.channels = channels
