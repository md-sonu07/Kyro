from typing import Dict, Optional, AsyncGenerator
from app.agent.context import AgentContext
from app.ai.router import ai_router
from app.core.logging import logger

class AgentOrchestrator:
    def __init__(self):
        self.sessions: Dict[str, AgentContext] = {}

    def get_or_create_context(self, session_id: str) -> AgentContext:
        if session_id not in self.sessions:
            self.sessions[session_id] = AgentContext(session_id=session_id)
        return self.sessions[session_id]

    async def handle_user_message(
        self,
        session_id: str,
        content: str,
        provider: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        ctx = self.get_or_create_context(session_id)
        ctx.add_message("user", content)
        
        full_response = ""
        llm_messages = ctx.get_messages_for_llm()

        async for chunk in ai_router.stream_chat(messages=llm_messages, provider_name=provider):
            if chunk.content:
                full_response += chunk.content
                yield chunk.content

        ctx.add_message("assistant", full_response)

orchestrator = AgentOrchestrator()
