from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.commands.router import command_router
from app.core.logging import logger

router = APIRouter(prefix="/commands", tags=["commands"])

class CommandRequest(BaseModel):
    text: str
    provider: Optional[str] = None

@router.post("/execute")
async def execute_command(request: CommandRequest):
    """Execute a desktop command or AI query at high speed."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Command text cannot be empty")

    result = await command_router.execute(request.text, provider_name=request.provider)
    return result.model_dump()

@router.post("/parse")
async def parse_command_intent(request: CommandRequest):
    """Parse the intent of a voice/text command without running it."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Command text cannot be empty")

    parsed = command_router.parse_intent(request.text)
    return parsed.model_dump()
