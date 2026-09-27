from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentTaskRequest(BaseModel):
    goal: str
    context: Optional[Dict[str, Any]] = None

@router.post("/task")
async def create_task(request: AgentTaskRequest):
    return {
        "task_id": "task_demo_001",
        "goal": request.goal,
        "status": "initialized",
        "plan": [
            "1. Analyze user intention",
            "2. Determine required tools (browser, files, system)",
            "3. Request necessary user permissions",
            "4. Execute actions sequentially",
            "5. Verify and return output"
        ]
    }
