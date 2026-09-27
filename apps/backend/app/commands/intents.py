from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class IntentType(str, Enum):
    OPEN_APP = "OPEN_APP"
    SEARCH_WEB = "SEARCH_WEB"
    OPEN_URL = "OPEN_URL"
    SYSTEM_COMMAND = "SYSTEM_COMMAND"
    GREETING = "GREETING"
    AI_QUERY = "AI_QUERY"
    UNKNOWN = "UNKNOWN"

class ParsedIntent(BaseModel):
    intent_type: IntentType
    action_name: str
    params: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = 1.0
    direct_reply: Optional[str] = None

class CommandResult(BaseModel):
    success: bool
    intent_type: IntentType
    action_executed: Optional[str] = None
    voice_response: str
    text_response: str
    execution_time_ms: float = 0.0
    stream_needed: bool = False
    data: Optional[Dict[str, Any]] = None
