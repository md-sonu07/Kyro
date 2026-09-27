import asyncio
import time
from typing import Callable, Optional, List
from app.core.logging import logger

class WakeWordDetector:
    """
    Dedicated Wake Word Engine for detecting 'Hey Kyro' / 'Kyro'.
    Runs continuously in the background with minimal CPU footprint.
    """
    def __init__(
        self,
        wake_words: Optional[List[str]] = None,
        threshold: float = 0.5,
        on_detected: Optional[Callable[[], None]] = None,
    ):
        self.wake_words = [w.lower() for w in (wake_words or ["hey kyro", "kyro"])]
        self.threshold = threshold
        self.on_detected = on_detected
        self.is_running = False
        self._task: Optional[asyncio.Task] = None

    def set_callback(self, callback: Callable[[], None]):
        """Set or update the activation callback."""
        self.on_detected = callback

    def check_phrase(self, text: str) -> bool:
        """Check if incoming transcribed text contains any of the target wake words."""
        clean = text.strip().lower()
        for ww in self.wake_words:
            if ww in clean:
                logger.info(f"⚡ Wake word detected: '{ww}' in input: '{text}'")
                return True
        return False

    def trigger_activation(self, wake_word: str = "hey kyro"):
        """Trigger activation event when wake word is detected."""
        logger.info(f"🟢 [Kyro Wake Engine] Activated by '{wake_word}'!")
        if self.on_detected:
            try:
                self.on_detected()
            except Exception as e:
                logger.error(f"Error executing wake callback: {e}")

    async def start_listening(self):
        """Start background microphone monitoring."""
        if self.is_running:
            return
        self.is_running = True
        logger.info(f"🎧 [Kyro Wake Engine] Background listening started for: {self.wake_words}")

    async def stop_listening(self):
        """Stop background listening."""
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("🛑 [Kyro Wake Engine] Background listening stopped.")

# Global instance
wake_word_detector = WakeWordDetector()
