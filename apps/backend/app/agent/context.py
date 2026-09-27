from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import time

class AgentMessage(BaseModel):
    role: str
    content: str
    timestamp: float = Field(default_factory=time.time)
    meta: Optional[Dict[str, Any]] = None

class AgentContext(BaseModel):
    session_id: str
    messages: List[AgentMessage] = Field(default_factory=list)
    system_state: Dict[str, Any] = Field(default_factory=dict)
    active_skills: List[str] = Field(default_factory=list)

    def add_message(self, role: str, content: str, meta: Optional[Dict[str, Any]] = None):
        self.messages.append(AgentMessage(role=role, content=content, meta=meta))

    def get_messages_for_llm(self) -> List[Dict[str, str]]:
        return [{"role": m.role, "content": m.content} for m in self.messages]
