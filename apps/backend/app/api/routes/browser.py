from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/browser", tags=["browser"])

class NavigateRequest(BaseModel):
    url: str
    headless: Optional[bool] = False

@router.post("/navigate")
async def navigate(request: NavigateRequest):
    return {
        "status": "ready",
        "url": request.url,
        "message": f"Browser manager ready to open {request.url} (Playwright integration)"
    }
